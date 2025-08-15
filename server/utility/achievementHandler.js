import config from "../configuration/config.js";
import { getAllTransaction } from "../controller/MyTransactionsController.js";
import { getAchievements, updateAchivement } from "../controller/UtilController.js";
import MissingEntryDBException from "../exception/MissingEntryDBException.js";
import { logger } from "./loggerService.js";

const achievementIds = config.achievements.id;

export async function unlockAchievment(userId, achievementId, ...args) {

    let achievement = await getAchievements(config.db.NO_CONDITION, userId);

    if (!achievement || achievement === undefined || achievement === null) {
        throw new MissingEntryDBException(config.db.tables.achievement.name, userId);
    }

    const isAchievementUnlocked = ((achievement.unlockMask >> achievementId) & 1) === 1;

    if (isAchievementUnlocked)
        return;

    switch (achievementId) {
        case achievementIds.RECURRING_ROCKSTAR:
            const recurringTransactions = await getAllTransaction(config.db.NO_CONDITION, config.db.NO_CONDITION, config.db.NO_CONDITION, true, userId);
            if (recurringTransactions.length < 3)
                return;
            break;
        case achievementIds.THRIFT_SAVER:
            const expenseAmount = args[0];
            const savingsAmount = args[1];
            if (savingsAmount < 0.20 * expenseAmount)
                return;
            break;
        case achievementIds.EXPENSE_TRACKER:
            const previousMonth = args[0];
            const currentMonth = args[1];
            if (previousMonth >= currentMonth)
                return;
            break;
        case achievementIds.EMERGENCY_PLANNER:
            const isEnabled = args[0];
            const fundAllocated = args[1];
            if (!isEnabled || fundAllocated === 0)
                return;
            break;
        case achievementIds.HALFWAY_THERE:
            const amount1 = args[0];
            const targetAmount1 = args[1];
            if (amount1 < 0.50 * targetAmount1)
                return;
            break;
        case achievementIds.FUND_RAISER:
            const amount2 = args[0];
            const targetAmount2 = args[1];
            if (amount2 < targetAmount2)
                return;
            break;
        case achievementIds.BUDGET_GURU:
            const isExpenseLimitExceeded = args[0];
            if (!isExpenseLimitExceeded)
                return;
            break;
        default:
            logger(config.loggingLevel.WARN, `Encountered unknown achievement ID = {0}.`, achievementId);
            return;
    }

    logger(config.loggingLevel.INFO, `Achievement unlocked: {0} for user ID = {1}`, config.achievements.achievementList[achievementId].TITLE, userId);

    let newMask = ((1 << achievementId) | achievement.unlockMask);
    if ((newMask & 255) === 255) {
        logger(config.loggingLevel.INFO, `Achievement unlocked: {0} for user ID = {1}`, config.achievements.achievementList[achievementIds.MASTER_ACHIEVER].TITLE, userId);

        newMask = (newMask | (1 << achievementIds.MASTER_ACHIEVER));
    }

    achievement = await updateAchivement(newMask, userId);
}

