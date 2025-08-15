import { addAchievementDB, getAchievementDB, isAchievementEmptyDB, updateAchievmentDB } from "../repository/query/achievementQuery.js";
import achievementDBToDTOmapper from "../utility/mapper/achievementDBToDTOMapper.js";
import { isEmergencyFundEmptyDB } from "../repository/query/emergencyFundQuery.js";
import { getEnabledExpenseLimitsWithMonthlyAmountDB, isExpenseLimitsEmptyDB } from "../repository/query/expenseLimitQuery.js";
import { addEmergencyFund, addExpenseLimits, addMonthlyExpenseAggregate } from "./ManageExpensesController.js";
import { isMonthlyExpenseAggregateEmptyForGivenDateDB } from "../repository/query/monthlyExpenseAggregateQuery.js";
import setDayToOne from "../utility/dateDayToOneSetter.js";
import config from "../configuration/config.js";
import monthlyAmountWithLimitDBToDTOmapper from "../utility/mapper/monthlyAmountWithLimitDBToDTOmapper.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.loggingLevel;

export async function updateAchivement(newMask, userId) {
    logger(loggingLevel.INFO, `Updating achievement for user ID = {0}`, userId);
    logger(loggingLevel.DEBUG, `New mask: {0}`, JSON.stringify(newMask, null, 2));

    const updatedAchievmentDB = await updateAchievmentDB(newMask, userId);
    const updatedAchievment = achievementDBToDTOmapper(updatedAchievmentDB);

    logger(loggingLevel.INFO, `Achievement for user ID = {0} updated successfully`, userId);
    logger(loggingLevel.DEBUG, `Updated achievement: {0}`, JSON.stringify(updatedAchievment, null, 2));
}

export async function getAchievements(condition, userId) {
    logger(loggingLevel.INFO, `Fetching achievements with condition: {0}`, condition);

    const achievementDB = await getAchievementDB(condition, userId);
    const achievment = achievementDBToDTOmapper(achievementDB);

    logger(loggingLevel.DEBUG, `Fetched achievement: {0}`, JSON.stringify(achievment, null, 2));
    return achievment;
}

export async function populateEmergencyFund(userId) {

    logger(loggingLevel.INFO, `Populating emergency fund with default value for user ID = {0}`, userId);

    const isEmergencyFundEmpty = await isEmergencyFundEmptyDB(userId);

    if (!isEmergencyFundEmpty)
        return;

    const defaultEmergencyFund = {
        isEnabled: false,
        amount: 0,
        targetAmount: 0,
        defaultTargetAmount: 0,
        percentageValue: config.db.emergencyFund.DEFAULT_PERCENTAGE_VALUE,
        pastMonthCount: 0
    };

    await addEmergencyFund(defaultEmergencyFund, userId);
}

export async function populateExpenseLimits(userId) {

    logger(loggingLevel.INFO, `Populating expense limits with default value for user ID = {0}`, userId);

    const isExpenseLimitsEmpty = await isExpenseLimitsEmptyDB(userId);

    if (!isExpenseLimitsEmpty)
        return;

    let defaultExpenseLimits = Object.values(config.transactionTypes).map(transactionType => {
        if (transactionType !== config.transactionTypes.INCOME && transactionType !== config.transactionTypes.MISCELLANEOUS) {
            return {
                type: transactionType,
                amountLimit: 0,
                isEnabled: false
            };
        }
        return null;
    }).filter(Boolean);

    defaultExpenseLimits = [{
        type: config.expenseLimit.TOTAL_EXPENSE_LIMIT,
        amountLimit: 0,
        isEnabled: false
    }, ...defaultExpenseLimits];

    await addExpenseLimits(defaultExpenseLimits, userId);
}

export async function populateAchievement(userId) {
    logger(loggingLevel.INFO, `Populating achievement with default value for user ID = {0}`, userId);

    const isAchievementEmpty = await isAchievementEmptyDB(userId);

    if (!isAchievementEmpty)
        return;

    const achievementDB = await addAchievementDB({ unlockMask: 0 }, userId);
}

export async function populateMonthlyExpenseAggregate(userId, currentMonth = null) {
    currentMonth = currentMonth == null ? setDayToOne(new Date()) : setDayToOne(new Date(currentMonth));

    logger(loggingLevel.INFO, `Populating monthly expense aggregate with default values for month = {0}, for user ID = {1}`, currentMonth, userId);
    const isMonthlyExpenseAggregateEmptyForCurrentMonth = await isMonthlyExpenseAggregateEmptyForGivenDateDB(userId, currentMonth);

    if (!isMonthlyExpenseAggregateEmptyForCurrentMonth)
        return;

    let monthlyExpenseAggregateList = Object.values(config.transactionTypes).map(transactionType => {
        if (transactionType !== config.transactionTypes.MISCELLANEOUS) {
            return {
                type: transactionType,
                amount: 0,
                month: currentMonth
            };
        }
        return null;
    }).filter(Boolean);

    monthlyExpenseAggregateList = [{
        type: config.expenseLimit.TOTAL_EXPENSE_LIMIT,
        amount: 0,
        month: currentMonth
    }, ...monthlyExpenseAggregateList];

    await addMonthlyExpenseAggregate(monthlyExpenseAggregateList, userId);
}

export async function getEnabledExpenseLimitsWithMonthlyAmount(condition, userId) {

    logger(loggingLevel.INFO, `Fetching enabled expense limits with monthly amount with condition: {0}`, condition);
    const monthlyAmountWithLimitsDB = await getEnabledExpenseLimitsWithMonthlyAmountDB(condition, userId);
    const monthlyAmountWithLimits = monthlyAmountWithLimitsDB.map(monthlyAmountWithLimitDB => monthlyAmountWithLimitDBToDTOmapper(monthlyAmountWithLimitDB));

    logger(loggingLevel.DEBUG, `Fetched enabled expense limits with monthly amount: {0}`, JSON.stringify(monthlyAmountWithLimits, null, 2));
    return monthlyAmountWithLimits;
}