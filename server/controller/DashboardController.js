import config from "../configuration/config.js";
import { getAllTransactionDB } from "../repository/query/transactionQuery.js";
import expenseLimitNotificationBuilder from "../utility/builder/expenseLimitTipBuilder.js";
import setDayToOne from "../utility/dateDayToOneSetter.js";
import transactionDBToDTOmapper from "../utility/mapper/transactionDBToDTOmapper.js";
import { getEmergencyFund } from "./ManageExpensesController.js";
import { getAllTransaction } from "./MyTransactionsController.js";
import dashboardSkeletonBuilder from "../utility/builder/dashboardSkeletonBuilder.js";
import { getAchievements, getEnabledExpenseLimitsWithMonthlyAmount, populateMonthlyExpenseAggregate } from "./UtilController.js";
import { getCredential } from "./LoginController.js";
import getRandomTips from "../utility/builder/randomTipGenerator.js";
import shuffleArray from "../utility/arrayShuffler.js";
import { logger } from "../utility/loggerService.js";
import MissingEntryDBException from "../exception/MissingEntryDBException.js";

const loggingLevel = config.loggingLevel;

async function getWeeklyReport(userId) {

    logger(loggingLevel.INFO, `Fetching weekly report for user ID = {0}`, userId);

    let todayDate = new Date();
    let previous7Date = new Date();
    previous7Date.setDate(todayDate.getDate() - 7);

    todayDate = todayDate.toLocaleDateString('en-CA');
    previous7Date = previous7Date.toLocaleDateString('en-CA');

    logger(loggingLevel.INFO, `Fetching all transactions in date range: {0} to {1}`, previous7Date, todayDate);

    const condition = `${config.db.tables.transaction.attributes.TRANSACTION_DATE} BETWEEN '${previous7Date}' AND '${todayDate}'`;
    const transactionsDB = await getAllTransactionDB(condition, config.db.tables.transaction, userId);

    logger(loggingLevel.INFO, `Fetched {0} transactions`, transactionsDB.length);
    if (transactionsDB.length > 0)
        logger(loggingLevel.DEBUG, `Transactions: {0}`, JSON.stringify(transactionsDB, null, 2));

    let expenseAmount = 0, incomeAmount = 0;

    transactionsDB.forEach(transactionDB => {
        const transaction = transactionDBToDTOmapper(transactionDB)
        transaction.amount = parseFloat(transaction.amount);

        if (transaction.amount < 0)
            expenseAmount += Math.abs(transaction.amount);
        else
            incomeAmount += transaction.amount;
    });

    logger(loggingLevel.INFO, `Weekly report: income = {0}, expenses = {1}, savings = {2}`, incomeAmount, expenseAmount, Math.max(incomeAmount - expenseAmount, 0));

    return {
        expenses: expenseAmount,
        savings: Math.max(incomeAmount - expenseAmount, 0)
    };
}

export async function getDashboard(userId) {

    logger(loggingLevel.INFO, `Fetching dashboard content for user ID = {0}`, userId);

    let dashboard = dashboardSkeletonBuilder();
    dashboard.weeklyReport = await getWeeklyReport(userId);
    dashboard.upcomingTransactions = await getAllTransaction(`EXTRACT(DAY FROM ${config.db.tables.recurringTransaction.attributes.TRANSACTION_DATE}) > EXTRACT(DAY FROM CURRENT_DATE) ORDER BY EXTRACT(DAY FROM ${config.db.tables.recurringTransaction.attributes.TRANSACTION_DATE}) ASC`, 0, 3, true, userId);

    logger(loggingLevel.INFO, `Fetched {0} upcoming transactions.`, dashboard.upcomingTransactions.length);
    if (dashboard.upcomingTransactions.length > 0)
        logger(loggingLevel.DEBUG, `Upcoming transactions: {0}`, JSON.stringify(dashboard.upcomingTransactions, null, 2));

    const emergencyFunds = await getEmergencyFund(config.db.NO_CONDITION, userId);

    if (!emergencyFunds || emergencyFunds == undefined || emergencyFunds == null || emergencyFunds.length === 0) {
        throw new MissingEntryDBException(config.db.tables.emergencyFund.TABLE_NAME, userId);
    }

    dashboard.emergencyFund = {
        delta: parseFloat(emergencyFunds[0].amount) >= parseFloat(emergencyFunds[0].targetAmount) ? 100 : (parseFloat(emergencyFunds[0].amount) * 100 / parseFloat(emergencyFunds[0].targetAmount)),
        ...emergencyFunds[0]
    }

    if (dashboard.emergencyFund.isEnabled) {
        logger(loggingLevel.INFO, `Emergency fund is enabled. Amount = {0}, Target amount = {1}`, dashboard.emergencyFund.amount, dashboard.emergencyFund.targetAmount);
    } else {
        logger(loggingLevel.INFO, `Emergency fund is not enabled.`);
    }

    logger(loggingLevel.DEBUG, "Calculated delta for emergency fund: {0}", dashboard.emergencyFund.delta);

    dashboard.achievementMask = await getAchievements(config.db.NO_CONDITION, userId);

    if (!dashboard.achievementMask || dashboard.achievementMask == undefined || dashboard.achievementMask == null) {
        throw new MissingEntryDBException(config.db.tables.achievement.TABLE_NAME, userId);
    }

    const credentials = await getCredential(`WHERE ${config.db.tables.credential.attributes.ID} = '${userId}'`);

    if (!credentials || credentials == undefined || credentials == null || credentials.length === 0) {
        throw new MissingEntryDBException(config.db.tables.credential.TABLE_NAME, userId);
    }

    const monthlyAmountWithLimits = await getEnabledExpenseLimitsWithMonthlyAmount(`${config.db.tables.monthlyExpenseAggregate.TABLE_NAME + "." + config.db.tables.monthlyExpenseAggregate.attributes.MONTH} = '${setDayToOne(new Date())}'`, userId);

    if (monthlyAmountWithLimits.length > 0) {
        logger(loggingLevel.DEBUG, `Fetched monthly amount with limits: {0}`, JSON.stringify(monthlyAmountWithLimits, null, 2));
        dashboard.notifications = [
            ...expenseLimitNotificationBuilder(monthlyAmountWithLimits)
        ];
    }
    else {
        logger(loggingLevel.INFO, `No monthly amount with limits found. Adding default expense limit notification to enable it.`);
        dashboard.notifications = [
            { message: config.userInterface.dashboardNotification.EXPENSE_LIMIT_MESSAGE, type: config.notificationType.important }
        ];
    }

    if (credentials[0].creditsLeft === 0) {
        logger(loggingLevel.INFO, `Credits left = 0. Adding suitable notification.`);
        dashboard.notifications.push({ message: config.userInterface.dashboardNotification.CREDITS_LEFT_MESSAGE, type: config.notificationType.warn });
    }

    if (credentials[0].isTipEnabled) {
        logger(loggingLevel.INFO, `Tips are enabled. Adding random tips to notifications.`);
        dashboard.notifications = [
            ...dashboard.notifications,
            ...getRandomTips()
        ];

        dashboard.notifications = shuffleArray(dashboard.notifications);
    }

    logger(loggingLevel.DEBUG, "Dashboard content build successfully: {0}", JSON.stringify(dashboard, null, 2));

    return dashboard;
}

