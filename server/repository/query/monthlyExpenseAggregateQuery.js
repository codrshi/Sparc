import config from "../../configuration/config.js";
import { logger } from "../../utility/loggerService.js";
import { getFilter, getInsertBatch, monthlyExpenseAggregateConditionBuilder } from "../dbUtil.js";
import db from "../serverDB.js";

const monthlyExpenseAggregateDB = config.db.tables.monthlyExpenseAggregate;
const allowedTransactionTypes = Object.values(config.transactionTypes).map(type => `'${type}'`).join(`,`);
const credentialDB = config.db.tables.credential;
const loggingLevel = config.loggingLevel;

export async function createMonthlyExpenseAggregateDB() {
    const query = `CREATE TABLE IF NOT EXISTS ${monthlyExpenseAggregateDB.TABLE_NAME} (
        ${monthlyExpenseAggregateDB.attributes.TRANSACTION_TYPE} VARCHAR(50) NOT NULL CHECK (${monthlyExpenseAggregateDB.attributes.TRANSACTION_TYPE} IN (${[`'${config.expenseLimit.TOTAL_EXPENSE_LIMIT}'`, allowedTransactionTypes]})),
        ${monthlyExpenseAggregateDB.attributes.MONTH} DATE NOT NULL CHECK (EXTRACT(DAY FROM ${monthlyExpenseAggregateDB.attributes.MONTH}) = 1),
        ${monthlyExpenseAggregateDB.attributes.MONTHLY_AMOUNT} NUMERIC NOT NULL DEFAULT 0,
        ${monthlyExpenseAggregateDB.foreignKey.CREDENTIAL_ID} TEXT NOT NULL,
        PRIMARY KEY (${monthlyExpenseAggregateDB.foreignKey.CREDENTIAL_ID}, ${monthlyExpenseAggregateDB.attributes.MONTH}, ${monthlyExpenseAggregateDB.attributes.TRANSACTION_TYPE}),
        FOREIGN KEY (${monthlyExpenseAggregateDB.foreignKey.CREDENTIAL_ID}) REFERENCES ${credentialDB.TABLE_NAME}(${credentialDB.attributes.ID}) ON DELETE CASCADE );`;

    logger(loggingLevel.DEBUG, `Executing CREATE query:  {0}`, query);

    try {
        await db.query(query);
        logger(loggingLevel.INFO, `CREATE query on table {0} executed successfully.`, credentialDB.TABLE_NAME);
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}

export async function isMonthlyExpenseAggregateEmptyForGivenDateDB(userId, date) {
    const filter = getFilter(userId, `${monthlyExpenseAggregateDB.attributes.MONTH} = '${date}'`);
    const query = `SELECT COUNT(*) FROM ${monthlyExpenseAggregateDB.TABLE_NAME} ${filter};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const { rows } = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, monthlyExpenseAggregateDB.TABLE_NAME);
        return parseInt(rows[0].count) === 0;
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}

export async function getMonthlyExpenseAggregateDB(condition, userId) {
    const filter = getFilter(userId, condition);
    const query = `SELECT
            to_char(${monthlyExpenseAggregateDB.attributes.MONTH},'YYYY-MM-DD') as ${monthlyExpenseAggregateDB.attributes.MONTH},
            ${monthlyExpenseAggregateDB.attributes.MONTHLY_AMOUNT},
            ${monthlyExpenseAggregateDB.attributes.TRANSACTION_TYPE},
            ${monthlyExpenseAggregateDB.foreignKey.CREDENTIAL_ID} 
            FROM ${monthlyExpenseAggregateDB.TABLE_NAME} ${filter};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, monthlyExpenseAggregateDB.TABLE_NAME);
        return res.rows;
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function addMonthlyExpenseAggregateDB(monthlyExpenseAggregateList, userId) {
    const insertBatch = getInsertBatch(monthlyExpenseAggregateDB.TABLE_NAME, userId, monthlyExpenseAggregateList);

    const query = `INSERT INTO ${monthlyExpenseAggregateDB.TABLE_NAME}(
            ${monthlyExpenseAggregateDB.attributes.MONTH}, 
            ${monthlyExpenseAggregateDB.attributes.TRANSACTION_TYPE},
            ${monthlyExpenseAggregateDB.attributes.MONTHLY_AMOUNT},
            ${monthlyExpenseAggregateDB.foreignKey.CREDENTIAL_ID})
            VALUES ${insertBatch}
            RETURNING ${monthlyExpenseAggregateDB.attributes.MONTHLY_AMOUNT},
            ${monthlyExpenseAggregateDB.attributes.TRANSACTION_TYPE},
            to_char(${monthlyExpenseAggregateDB.attributes.MONTH},'YYYY-MM-DD') as ${monthlyExpenseAggregateDB.attributes.MONTH},
            ${monthlyExpenseAggregateDB.foreignKey.CREDENTIAL_ID};`;

    logger(loggingLevel.DEBUG, `Executing INSERT query: {0}`, query);

    try {
        const res = await db.query(query);
        logger(loggingLevel.INFO, `INSERT query on table {0} executed successfully.`, monthlyExpenseAggregateDB.TABLE_NAME);

        return res.rows;
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }

}

export async function updateMonthlyExpenseAggregateDB(transaction, sign, userId) {

    const filter = getFilter(userId, monthlyExpenseAggregateConditionBuilder(transaction));
    const updateQuery = `UPDATE ${monthlyExpenseAggregateDB.TABLE_NAME}
                        SET ${monthlyExpenseAggregateDB.attributes.MONTHLY_AMOUNT} = ${monthlyExpenseAggregateDB.attributes.MONTHLY_AMOUNT} ${sign} ${transaction.amount} 
                        ${filter} 
                        RETURNING ${monthlyExpenseAggregateDB.attributes.MONTHLY_AMOUNT},
                        ${monthlyExpenseAggregateDB.attributes.TRANSACTION_TYPE},
                        to_char(${monthlyExpenseAggregateDB.attributes.MONTH},'YYYY-MM-DD') as ${monthlyExpenseAggregateDB.attributes.MONTH},
                        ${monthlyExpenseAggregateDB.foreignKey.CREDENTIAL_ID};`;

    logger(loggingLevel.DEBUG, `Executing UPDATE query: {0}`, updateQuery);

    try {
        const res = await db.query(updateQuery);

        logger(loggingLevel.INFO, `UPDATE query on table {0} executed successfully.`, monthlyExpenseAggregateDB.TABLE_NAME);
        return res.rows;
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}