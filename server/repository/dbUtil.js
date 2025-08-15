import config from "../configuration/config.js";
import UnknownTableException from "../exception/UnknownTableException.js";
import setDayToOne from "../utility/dateDayToOneSetter.js";
import { logger } from "../utility/loggerService.js";
import { createAchievementDB } from "./query/achievementQuery.js";
import { createCredentialDB } from "./query/credentialQuery.js";
import { createEmergencyFundDB } from "./query/emergencyFundQuery.js";
import { createExpenseLimitDB } from "./query/expenseLimitQuery.js";
import { createMonthlyExpenseAggregateDB } from "./query/monthlyExpenseAggregateQuery.js";
import { createTransactionDB } from "./query/transactionQuery.js";

const transactionDB = config.db.tables.transaction;
const recurringTransactionDB = config.db.tables.recurringTransaction;
const expenseLimitDB = config.db.tables.expenseLimit;
const monthlyExpenseAggregateDB = config.db.tables.monthlyExpenseAggregate;
const loggingLevel = config.loggingLevel;

export async function initializeDB() {
    try {
        await createCredentialDB();
        await createTransactionDB(transactionDB);
        await createTransactionDB(recurringTransactionDB);
        await createExpenseLimitDB();
        await createMonthlyExpenseAggregateDB();
        await createEmergencyFundDB();
        await createAchievementDB();

        logger(loggingLevel.INFO, `All tables created/checked successfully.`);
    } catch (error) {
        logger(loggingLevel.ERROR, `Error while creating/checking tables: {0} \n{1}`, error, error.stack);
        throw error;
    }
}

export function getFilter(userId, condition) {
    let filter = [];

    if (userId !== null)
        filter.push(`${transactionDB.foreignKey.CREDENTIAL_ID} = '${userId}'`);

    if (condition !== config.db.NO_CONDITION)
        filter.push(`${condition}`);

    return filter.length > 0 ? ` WHERE ${filter.join(' AND ')} ` : '';
}

export function getInsertBatch(table, userId, ...args) {
    let insertBatch = "";

    switch (table) {
        case expenseLimitDB.TABLE_NAME:
            const expenseLimits = args[0];

            insertBatch = expenseLimits.map(limit =>
                `('${setDayToOne(new Date())}', '${limit.type}', ${limit.isEnabled}, ${parseFloat(parseFloat(limit.amountLimit).toFixed(2))}, '${userId}')`
            ).join(',');
            break;
        case monthlyExpenseAggregateDB.TABLE_NAME:
            const monthlyExpenseAggregateList = args[0];

            insertBatch = monthlyExpenseAggregateList.map(expense =>
                `('${expense.month}', '${expense.type}', ${parseFloat(parseFloat(expense.amount).toFixed(2))}, '${userId}')`
            ).join(',');
            break;
        default:
            throw new UnknownTableException(`Encountered wrong table = {0} while creating insert batch. Expected tables = {1}`, table, [expenseLimitDB.TABLE_NAME, monthlyExpenseAggregateDB.TABLE_NAME]);
    }

    return insertBatch;
}

export function monthlyExpenseAggregateConditionBuilder(transaction) {
    let condition = `${config.db.tables.monthlyExpenseAggregate.attributes.MONTH} = '${setDayToOne(new Date(transaction.date))}'`;

    if (transaction.amount < 0) {
        condition += ` AND ${config.db.tables.monthlyExpenseAggregate.attributes.TRANSACTION_TYPE} IN ('${transaction.type}', '${config.expenseLimit.TOTAL_EXPENSE_LIMIT}')`;
    }
    else
        condition += ` AND ${config.db.tables.monthlyExpenseAggregate.attributes.TRANSACTION_TYPE} = '${config.transactionTypes.INCOME}'`;

    return condition;
}


