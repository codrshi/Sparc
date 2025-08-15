import config from "../../configuration/config.js";
import { logger } from "../../utility/loggerService.js";
import { getFilter, getInsertBatch } from "../dbUtil.js";
import db from "../serverDB.js";


const allowedTransactionTypes = Object.values(config.transactionTypes).map(type => `'${type}'`).join(`,`);
const credentialDB = config.db.tables.credential;
const expenseLimitDB = config.db.tables.expenseLimit;
const monthlyExpenseAggregate = config.db.tables.monthlyExpenseAggregate;
const loggingLevel = config.loggingLevel;

const el_TRANSACTION_TYPE = expenseLimitDB.TABLE_NAME + "." + expenseLimitDB.attributes.TRANSACTION_TYPE;
const el_TRANSACTION_AMOUNT_LIMIT = expenseLimitDB.TABLE_NAME + "." + expenseLimitDB.attributes.TRANSACTION_AMOUNT_LIMIT;
const el_IS_ENABLED = expenseLimitDB.TABLE_NAME + "." + expenseLimitDB.attributes.IS_ENABLED;
const el_CREDENTIAL_ID = expenseLimitDB.TABLE_NAME + "." + expenseLimitDB.foreignKey.CREDENTIAL_ID;
const el_CREATION_MONTH = expenseLimitDB.TABLE_NAME + "." + expenseLimitDB.attributes.CREATION_MONTH;

const mea_TRANSACTION_TYPE = monthlyExpenseAggregate.TABLE_NAME + "." + monthlyExpenseAggregate.attributes.TRANSACTION_TYPE;
const mea_MONTHLY_AMOUNT = monthlyExpenseAggregate.TABLE_NAME + "." + monthlyExpenseAggregate.attributes.MONTHLY_AMOUNT;
const mea_CREDENTIAL_ID = monthlyExpenseAggregate.TABLE_NAME + "." + monthlyExpenseAggregate.foreignKey.CREDENTIAL_ID;
const mea_month = monthlyExpenseAggregate.TABLE_NAME + "." + monthlyExpenseAggregate.attributes.MONTH;

export async function createExpenseLimitDB() {
    const query = `CREATE TABLE IF NOT EXISTS ${expenseLimitDB.TABLE_NAME} (
        ${expenseLimitDB.attributes.CREATION_MONTH} DATE NOT NULL CHECK (EXTRACT(DAY FROM ${expenseLimitDB.attributes.CREATION_MONTH}) = 1),
        ${expenseLimitDB.attributes.TRANSACTION_TYPE} VARCHAR(50) NOT NULL CHECK (${expenseLimitDB.attributes.TRANSACTION_TYPE} IN (${[`'${config.expenseLimit.TOTAL_EXPENSE_LIMIT}'`, allowedTransactionTypes]})),
        ${expenseLimitDB.attributes.IS_ENABLED} BOOLEAN NOT NULL DEFAULT FALSE,   
        ${expenseLimitDB.attributes.TRANSACTION_AMOUNT_LIMIT} NUMERIC NOT NULL DEFAULT 0,
        ${expenseLimitDB.foreignKey.CREDENTIAL_ID} TEXT NOT NULL,
        PRIMARY KEY (${expenseLimitDB.foreignKey.CREDENTIAL_ID}, ${expenseLimitDB.attributes.CREATION_MONTH}, ${expenseLimitDB.attributes.TRANSACTION_TYPE}),
        FOREIGN KEY (${expenseLimitDB.foreignKey.CREDENTIAL_ID}) REFERENCES ${credentialDB.TABLE_NAME}(${credentialDB.attributes.ID}) ON DELETE CASCADE );`;

    logger(loggingLevel.DEBUG, `Executing CREATE query:  {0}`, query);
    try {
        await db.query(query);
        logger(loggingLevel.INFO, `CREATE query on table {0} executed successfully.`, expenseLimitDB.TABLE_NAME);
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}

export async function isExpenseLimitsEmptyDB(userId) {

    const filter = getFilter(userId, config.db.NO_CONDITION);
    const query = `SELECT COUNT(*) FROM ${expenseLimitDB.TABLE_NAME} ${filter};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const { rows } = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, expenseLimitDB.TABLE_NAME);
        return parseInt(rows[0].count) === 0;
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}

export async function clearExpenseLimitsDB(userId) {
    const filter = getFilter(userId, config.db.NO_CONDITION);
    const query = `DELETE FROM ${expenseLimitDB.TABLE_NAME} ${filter};`;

    logger(loggingLevel.DEBUG, `Executing DELETE query: {0}`, query);
    try {
        await db.query(query);
        logger(loggingLevel.INFO, `DELETE query on table {0} executed successfully.`, expenseLimitDB.TABLE_NAME);
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function addExpenseLimitsDB(expenseLimits, userId) {
    const insertBatch = getInsertBatch(expenseLimitDB.TABLE_NAME, userId, expenseLimits);
    const query = `INSERT INTO ${expenseLimitDB.TABLE_NAME}(
            ${expenseLimitDB.attributes.CREATION_MONTH}, 
            ${expenseLimitDB.attributes.TRANSACTION_TYPE},
            ${expenseLimitDB.attributes.IS_ENABLED}, 
            ${expenseLimitDB.attributes.TRANSACTION_AMOUNT_LIMIT},
            ${expenseLimitDB.foreignKey.CREDENTIAL_ID})
            VALUES ${insertBatch}
            RETURNING ${expenseLimitDB.attributes.TRANSACTION_AMOUNT_LIMIT},
            ${expenseLimitDB.attributes.TRANSACTION_TYPE},
            ${expenseLimitDB.attributes.IS_ENABLED},
            to_char(${expenseLimitDB.attributes.CREATION_MONTH},'YYYY-MM-DD') as ${expenseLimitDB.attributes.CREATION_MONTH},
            ${expenseLimitDB.foreignKey.CREDENTIAL_ID};`;

    logger(loggingLevel.DEBUG, `Executing INSERT query: {0}`, query);
    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `INSERT query on table {0} executed successfully.`, expenseLimitDB.TABLE_NAME);
        return res.rows;
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function getAllExpenseLimitsDB(condition, userId) {

    const filter = getFilter(userId, condition);
    const query = `SELECT
            to_char(${expenseLimitDB.attributes.CREATION_MONTH},'YYYY-MM-DD') as ${expenseLimitDB.attributes.CREATION_MONTH},
            ${expenseLimitDB.attributes.TRANSACTION_TYPE},
            ${expenseLimitDB.attributes.IS_ENABLED}, 
            ${expenseLimitDB.attributes.TRANSACTION_AMOUNT_LIMIT},
            ${expenseLimitDB.foreignKey.CREDENTIAL_ID} 
            FROM ${expenseLimitDB.TABLE_NAME} ${filter};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, expenseLimitDB.TABLE_NAME);
        return res.rows;
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function getExpenseLimitForGivenTypeDB(type, userId) {
    const filter = getFilter(userId, `${expenseLimitDB.attributes.TRANSACTION_TYPE}='${type}'`);
    const query = `SELECT
            to_char(${expenseLimitDB.attributes.CREATION_MONTH},'YYYY-MM-DD') as ${expenseLimitDB.attributes.CREATION_MONTH},
            ${expenseLimitDB.attributes.TRANSACTION_TYPE},
            ${expenseLimitDB.attributes.IS_ENABLED}, 
            ${expenseLimitDB.attributes.TRANSACTION_AMOUNT_LIMIT},
            ${expenseLimitDB.foreignKey.CREDENTIAL_ID}
            FROM ${expenseLimitDB.TABLE_NAME}
            ${filter};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, expenseLimitDB.TABLE_NAME);
        return res.rows[0];
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function getEnabledExpenseLimitsWithMonthlyAmountDB(condition, userId) {

    const query = `SELECT ${el_TRANSACTION_TYPE},
            ${el_TRANSACTION_AMOUNT_LIMIT},
            ${el_CREATION_MONTH},
            ${mea_MONTHLY_AMOUNT},
            ${mea_month}
            FROM ${expenseLimitDB.TABLE_NAME} JOIN ${monthlyExpenseAggregate.TABLE_NAME}
            ON ${el_TRANSACTION_TYPE} = ${mea_TRANSACTION_TYPE}
            AND ${el_CREDENTIAL_ID} = ${mea_CREDENTIAL_ID}
            WHERE ${el_CREDENTIAL_ID} = '${userId}'
            AND ${el_IS_ENABLED} = true
            AND ${condition};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);
    try {
        const res = await db.query(query);
        logger(loggingLevel.INFO, `SELECT query on tables {0}, {1} executed successfully.`, expenseLimitDB.TABLE_NAME, monthlyExpenseAggregate.TABLE_NAME);

        return res.rows;
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}