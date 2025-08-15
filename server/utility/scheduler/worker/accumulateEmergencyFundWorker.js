import { parentPort, workerData } from "worker_threads";
import { getMonthlyExpenseAggregate, updateEmergencyFund } from '../../../controller/ManageExpensesController.js';
import config from '../../../configuration/config.js';
import setDayToOne from "../../dateDayToOneSetter.js";
import { unlockAchievment } from "../../achievementHandler.js";
import { logger } from "../../loggerService.js";

const loggingLevel = config.loggingLevel;

async function executeWorker() {
    const emergencyFund = workerData.emergencyFund;
    const userId = emergencyFund.credentialId;

    logger(loggingLevel.INFO, `accumulate-emergency-fund-job worker started for userId = ${userId}`);
    logger(loggingLevel.DEBUG, `Emergency fund = {0}`, JSON.stringify(emergencyFund, null, 2));

    try {
        let previousDate = new Date();
        previousDate.setMonth(previousDate.getMonth() - 1);
        const monthlyExpenseAggregates = await getMonthlyExpenseAggregate(` ${config.db.tables.monthlyExpenseAggregate.attributes.MONTH} = '${setDayToOne(previousDate)}' AND ${config.db.tables.monthlyExpenseAggregate.attributes.TRANSACTION_TYPE} IN ('${config.expenseLimit.TOTAL_EXPENSE_LIMIT}','${config.transactionTypes.INCOME}') `, userId);

        logger(loggingLevel.DEBUG, `Fetched monthly expense aggregates = {0}`, JSON.stringify(monthlyExpenseAggregates, null, 2));

        let expenseAmount = 0, savingsAmount = 0;
        monthlyExpenseAggregates.forEach(monthlyExpenseAggregate => {
            if (monthlyExpenseAggregate.type === config.expenseLimit.TOTAL_EXPENSE_LIMIT) {
                expenseAmount += parseFloat(monthlyExpenseAggregate.amount);
                savingsAmount += parseFloat(monthlyExpenseAggregate.amount);
            }
            else if (monthlyExpenseAggregate.type === config.transactionTypes.INCOME)
                savingsAmount += parseFloat(monthlyExpenseAggregate.amount);
        });

        emergencyFund.pastMonthCount = parseFloat(emergencyFund.pastMonthCount) + 1;
        emergencyFund.defaultTargetAmount = (parseFloat(emergencyFund.defaultTargetAmount) + Math.abs(expenseAmount)) / emergencyFund.pastMonthCount;

        if (emergencyFund.isEnabled && savingsAmount > 0)
            emergencyFund.amount = parseFloat(emergencyFund.amount) + (parseFloat(emergencyFund.percentageValue) * savingsAmount) / 100;

        const updatedEmergencyFund = await updateEmergencyFund(emergencyFund, userId);
        logger(loggingLevel.DEBUG, `Updated emergency fund = {0}`, JSON.stringify(updatedEmergencyFund, null, 2));

        unlockAchievment(userId, config.achievements.id.THRIFT_SAVER, expenseAmount, savingsAmount);
        unlockAchievment(userId, config.achievements.id.HALFWAY_THERE, updatedEmergencyFund.amount, updatedEmergencyFund.targetAmount);
        unlockAchievment(userId, config.achievements.id.FUND_RAISER, updatedEmergencyFund.amount, updatedEmergencyFund.targetAmount);
    }
    catch (error) {
        logger(loggingLevel.ERROR, `accumulate-emergency-fund-job worker for user ID = {0} failed with error: {0}`, userId, error);
        parentPort.postMessage({ success: false, error: error.message });
    }

    logger(loggingLevel.INFO, `accumulate-emergency-fund-job worker for user ID = {0} finished.`, userId);
    parentPort.postMessage({ success: true });
}

executeWorker();

