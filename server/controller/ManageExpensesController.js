import config from "../configuration/config.js";
import buildExpenseLimitDialogMessage from "../utility/builder/expenseLimitDialogBuilder.js";
import expenseLimitsDBToDTOmapper from "../utility/mapper/expenseLimitsDBToDTOmapper.js";
import monthlyExpenseAggregateDBToDTOmapper from "../utility/mapper/monthlyExpenseAggregateDBToDTOMapper.js";
import { addExpenseLimitsDB, clearExpenseLimitsDB, getAllExpenseLimitsDB } from "../repository/query/expenseLimitQuery.js";
import { addMonthlyExpenseAggregateDB, getMonthlyExpenseAggregateDB, updateMonthlyExpenseAggregateDB } from "../repository/query/monthlyExpenseAggregateQuery.js";
import { addEmergencyFundDB, getEmergencyFundDB, updateEmergencyFundDB } from "../repository/query/emergencyFundQuery.js";
import emergencyFundDBToDTOmapper from "../utility/mapper/emergencyFundDBToDTOmapper.js";
import { getEnabledExpenseLimitsWithMonthlyAmount, populateMonthlyExpenseAggregate } from "./UtilController.js";
import { unlockAchievment } from "../utility/achievementHandler.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.loggingLevel;

export async function addExpenseLimits(expenseLimits, userId) {

    logger(loggingLevel.INFO, `Adding expense limits for user ID = {0}`, userId);
    logger(loggingLevel.DEBUG, `Expense limits: {0}`, JSON.stringify(expenseLimits, null, 2));

    await clearExpenseLimits(userId);
    const expenseLimitsDB = await addExpenseLimitsDB(expenseLimits, userId);

    logger(loggingLevel.INFO, `Expense limits added successfully`);
    logger(loggingLevel.DEBUG, `Expense limits added: {0}`, JSON.stringify(expenseLimitsDB, null, 2));
};

export async function clearExpenseLimits(userId) {
    logger(loggingLevel.INFO, `Purging expense limits for user ID = {0}`, userId);
    await clearExpenseLimitsDB(userId);
}

export async function getExpenseLimits(condition, userId) {
    logger(loggingLevel.INFO, `Fetching expense limits with condition: {0}`, condition);

    const expenseLimitsDB = await getAllExpenseLimitsDB(condition, userId);
    const expenseLimits = expenseLimitsDB.map((expenseLimitDB) => expenseLimitsDBToDTOmapper(expenseLimitDB));

    logger(loggingLevel.DEBUG, `Fetched expense limits: {0}`, JSON.stringify(expenseLimits, null, 2));
    return expenseLimits;
}

export async function getMonthlyExpenseAggregate(condition, userId) {
    logger(loggingLevel.INFO, `Fetching monthly expense aggregates with condition: {0}`, condition);

    const monthlyExpenseAggregatesDB = await getMonthlyExpenseAggregateDB(condition, userId);
    const monthlyExpenseAggregates = monthlyExpenseAggregatesDB.map((monthlyExpenseAggregateDB) => monthlyExpenseAggregateDBToDTOmapper(monthlyExpenseAggregateDB));

    logger(loggingLevel.DEBUG, `Fetched monthly expense aggregates: {0}`, JSON.stringify(monthlyExpenseAggregates, null, 2));
    return monthlyExpenseAggregates;
}

export async function addMonthlyExpenseAggregate(monthlyExpenseAggregateList, userId) {
    logger(loggingLevel.INFO, `Adding monthly expense aggregates for user ID = {0}`, userId);
    logger(loggingLevel.DEBUG, `Monthly expense aggregates: {0}`, JSON.stringify(monthlyExpenseAggregateList, null, 2));

    const monthlyExpenseAggregateListDB = await addMonthlyExpenseAggregateDB(monthlyExpenseAggregateList, userId);

    logger(loggingLevel.INFO, `Monthly expense aggregates added successfully`);
}

export async function updateMonthlyExpenseAggregate(oldTransaction, newTransaction, userId, isRequestFromScheduler = false) {
    let affectedTransactionTypes = new Set();
    let affectedMonths = new Set();

    logger(loggingLevel.INFO, `Updating monthly expense aggregates for user ID = {0}`, userId);
    logger(loggingLevel.DEBUG, `Old transaction: {0}`, JSON.stringify(oldTransaction, null, 2));
    logger(loggingLevel.DEBUG, `New transaction: {0}`, JSON.stringify(newTransaction, null, 2));

    if (newTransaction !== null) {
        logger(loggingLevel.INFO, "Updating monthly expense aggregates for new transaction.");
        await populateMonthlyExpenseAggregate(userId, newTransaction.date);
        const monthlyExpenseAggregateDBList = await updateMonthlyExpenseAggregateDB(newTransaction, config.mathOperation.ADD, userId);

        logger(loggingLevel.DEBUG, `Monthly expense aggregates updated: {0}`, JSON.stringify(monthlyExpenseAggregateDBList, null, 2));
        populateFieldsForFilter(monthlyExpenseAggregateDBList, affectedTransactionTypes, affectedMonths);

    }
    if (oldTransaction !== null) {
        logger(loggingLevel.INFO, "Updating monthly expense aggregates for old transaction.");
        await populateMonthlyExpenseAggregate(userId, oldTransaction.date);
        const monthlyExpenseAggregateDBList = await updateMonthlyExpenseAggregateDB(oldTransaction, config.mathOperation.SUBTRACT, userId);

        logger(loggingLevel.DEBUG, `Monthly expense aggregates updated: {0}`, JSON.stringify(monthlyExpenseAggregateDBList, null, 2));
        populateFieldsForFilter(monthlyExpenseAggregateDBList, affectedTransactionTypes, affectedMonths);
    }

    if (isRequestFromScheduler === true) {
        logger(loggingLevel.DEBUG, "Request is from scheduler, skipping expense limit dialog message generation.");
        return;
    }

    logger(loggingLevel.DEBUG, `Affected transaction types: {0}`, [...affectedTransactionTypes].join(','));
    logger(loggingLevel.DEBUG, `Affected months: {0}`, [...affectedMonths].join(','));

    let condition = `${config.db.tables.monthlyExpenseAggregate.TABLE_NAME}.${config.db.tables.monthlyExpenseAggregate.attributes.MONTH} IN (${[...affectedMonths].join(',')})`;
    if (affectedTransactionTypes.size > 0) {
        condition += ` AND ${config.db.tables.monthlyExpenseAggregate.TABLE_NAME}.${config.db.tables.monthlyExpenseAggregate.attributes.TRANSACTION_TYPE} IN (${[...affectedTransactionTypes].join(',')})`;
    }
    const monthlyAmountWithLimits = await getEnabledExpenseLimitsWithMonthlyAmount(condition, userId);

    return buildExpenseLimitDialogMessage(monthlyAmountWithLimits);
}

export async function addEmergencyFund(emergencyFund, userId) {
    logger(loggingLevel.INFO, `Adding emergency fund for user ID = {0}`, userId);
    logger(loggingLevel.DEBUG, `Emergency fund: {0}`, JSON.stringify(emergencyFund, null, 2));

    emergencyFund.amount = parseFloat(parseFloat(emergencyFund.amount).toFixed(2));
    emergencyFund.targetAmount = parseFloat(parseFloat(emergencyFund.targetAmount).toFixed(2));
    emergencyFund.percentageValue = parseFloat(parseFloat(emergencyFund.percentageValue).toFixed(2));
    const emergencyFundDB = await addEmergencyFundDB(emergencyFund, userId);
    emergencyFund = emergencyFundDBToDTOmapper(emergencyFundDB);

    logger(loggingLevel.INFO, `Emergency fund added successfully`);
    logger(loggingLevel.DEBUG, `Emergency fund added: {0}`, JSON.stringify(emergencyFund, null, 2));

}

export async function getEmergencyFund(condition, userId) {
    logger(loggingLevel.INFO, `Fetching emergency fund with condition: {0}`, condition);
    const emergencyFundsDB = await getEmergencyFundDB(condition, userId);
    const emergencyFund = emergencyFundsDB.map(emergencyFundDB => emergencyFundDBToDTOmapper(emergencyFundDB));

    logger(loggingLevel.INFO, "Emergency fund fetched successfully.");
    logger(loggingLevel.DEBUG, `Fetched emergency fund: {0}`, JSON.stringify(emergencyFund, null, 2));

    return emergencyFund;
}

export async function updateEmergencyFund(emergencyFund, userId) {
    logger(loggingLevel.INFO, `Updating emergency fund for user ID = {0}`, userId);
    logger(loggingLevel.DEBUG, `New emergency fund: {0}`, JSON.stringify(emergencyFund, null, 2));

    const emergencyFundDB = await updateEmergencyFundDB(emergencyFund, userId);

    unlockAchievment(userId, config.achievements.id.EMERGENCY_PLANNER, emergencyFund.isEnabled, emergencyFund.amount);
    emergencyFund = emergencyFundDBToDTOmapper(emergencyFundDB);

    logger(loggingLevel.INFO, `Emergency fund updated successfully`);
    logger(loggingLevel.DEBUG, `Emergency fund updated: {0}`, JSON.stringify(emergencyFund, null, 2));

    return emergencyFund;
}

function populateFieldsForFilter(monthlyExpenseAggregateDBList, affectedTransactionTypes, affectedMonths) {
    if (monthlyExpenseAggregateDBList !== undefined) {
        for (const monthlyExpenseAggregateDB of monthlyExpenseAggregateDBList) {
            const monthlyExpenseAggregate = monthlyExpenseAggregateDBToDTOmapper(monthlyExpenseAggregateDB);

            if (monthlyExpenseAggregate.type !== config.transactionTypes.INCOME) {
                logger(loggingLevel.DEBUG, `Adding transaction type: {0} to set affectedTransactionTypes.`, monthlyExpenseAggregate.type);
                affectedTransactionTypes.add(`'${monthlyExpenseAggregate.type}'`);
            }
            logger(loggingLevel.DEBUG, `Adding month: {0} to set affectedMonths.`, monthlyExpenseAggregate.month);
            affectedMonths.add(`'${monthlyExpenseAggregate.month}'`);
        }
    }
}