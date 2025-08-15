import config from "../../configuration/config.js";
import { logger } from "../../utility/loggerService.js";
import { getFilter } from "../dbUtil.js";
import db from "../serverDB.js";

const allowedTransactionTypes = Object.values(config.transactionTypes).map(type => `'${type}'`).join(`,`);
const allowedPaymentMethods = Object.values(config.paymentMethods).map(payment => `'${payment}'`).join(`,`);
const credentialDB = config.db.tables.credential;
const loggingLevel = config.loggingLevel;

export async function createTransactionDB(transactionDB) {

    const query = `CREATE TABLE IF NOT EXISTS ${transactionDB.TABLE_NAME} (
            ${transactionDB.attributes.TRANSACTION_ID} SERIAL PRIMARY KEY, 
            ${transactionDB.attributes.TRANSACTION_TYPE} VARCHAR(20) NOT NULL CHECK (${transactionDB.attributes.TRANSACTION_TYPE} IN (${allowedTransactionTypes})),
            ${transactionDB.attributes.TRANSACTION_DATE} DATE NOT NULL DEFAULT CURRENT_DATE,   
            ${transactionDB.attributes.TRANSACTION_DESCRIPTION} TEXT,
            ${transactionDB.attributes.PAYMENT_METHOD} VARCHAR(20) NOT NULL CHECK (${transactionDB.attributes.PAYMENT_METHOD} IN (${allowedPaymentMethods})),
            ${transactionDB.attributes.TRANSACTION_AMOUNT} NUMERIC NOT NULL ,
            ${transactionDB.foreignKey.CREDENTIAL_ID} TEXT NOT NULL,
            FOREIGN KEY (${transactionDB.foreignKey.CREDENTIAL_ID}) REFERENCES ${credentialDB.TABLE_NAME}(${credentialDB.attributes.ID}) ON DELETE CASCADE );`;


    logger(loggingLevel.DEBUG, `Executing CREATE query:  {0}`, query);
    try {
        await db.query(query);
        logger(loggingLevel.INFO, `CREATE query on table {0} executed successfully.`, transactionDB.TABLE_NAME);
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}

export async function getAllTransactionDB(condition, transactionDB, userId) {
    let filter = null;

    if (condition.startsWith("ORDER"))
        filter = getFilter(userId, config.db.NO_CONDITION) + " " + condition;
    else
        filter = getFilter(userId, condition);

    const query = `SELECT ${transactionDB.attributes.TRANSACTION_ID},
            ${transactionDB.attributes.TRANSACTION_TYPE},
            ${transactionDB.attributes.TRANSACTION_DESCRIPTION},
            to_char(${transactionDB.attributes.TRANSACTION_DATE},'YYYY-MM-DD') as ${transactionDB.attributes.TRANSACTION_DATE},
            ${transactionDB.attributes.PAYMENT_METHOD},
            ${transactionDB.attributes.TRANSACTION_AMOUNT},
            ${transactionDB.foreignKey.CREDENTIAL_ID}
             FROM ${transactionDB.TABLE_NAME} ${filter};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, transactionDB.TABLE_NAME);
        return res.rows;
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function updateTransactionDB(id, transaction, transactionDB, userId) {

    const filter = getFilter(userId, `${transactionDB.attributes.TRANSACTION_ID} = '${id}'`);

    const query = `UPDATE ${transactionDB.TABLE_NAME} SET 
            ${transactionDB.attributes.TRANSACTION_AMOUNT} = ${transaction.amount}, 
            ${transactionDB.attributes.TRANSACTION_TYPE} = '${transaction.type}', 
            ${transactionDB.attributes.TRANSACTION_DATE} = '${transaction.date}',
            ${transactionDB.attributes.TRANSACTION_DESCRIPTION} = '${transaction.description}', 
            ${transactionDB.attributes.PAYMENT_METHOD} = '${transaction.paymentMethod}'
            ${filter}
            RETURNING ${transactionDB.attributes.TRANSACTION_ID},
            ${transactionDB.attributes.TRANSACTION_TYPE},
            ${transactionDB.attributes.TRANSACTION_DESCRIPTION},
            to_char(${transactionDB.attributes.TRANSACTION_DATE},'YYYY-MM-DD') as ${transactionDB.attributes.TRANSACTION_DATE},
            ${transactionDB.attributes.PAYMENT_METHOD},
            ${transactionDB.attributes.TRANSACTION_AMOUNT},
            ${transactionDB.foreignKey.CREDENTIAL_ID};`;

    logger(loggingLevel.DEBUG, `Executing UPDATE query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `UPDATE query on table {0} executed successfully.`, transactionDB.TABLE_NAME);
        return res.rows[0];
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function addTransactionDB(transaction, transactionDB, userId) {

    const query = `INSERT INTO ${transactionDB.TABLE_NAME}(
            ${transactionDB.attributes.TRANSACTION_AMOUNT}, 
            ${transactionDB.attributes.TRANSACTION_TYPE},
            ${transactionDB.attributes.PAYMENT_METHOD}, 
            ${transactionDB.attributes.TRANSACTION_DATE}, 
            ${transactionDB.attributes.TRANSACTION_DESCRIPTION},
            ${transactionDB.foreignKey.CREDENTIAL_ID})
            VALUES (${transaction.amount}, 
                    '${transaction.type}', 
                    '${transaction.paymentMethod}',
                    '${transaction.date}',
                    '${transaction.description}',
                    '${userId}')
            RETURNING ${transactionDB.attributes.TRANSACTION_ID},
            ${transactionDB.attributes.TRANSACTION_TYPE},
            ${transactionDB.attributes.TRANSACTION_DESCRIPTION},
            to_char(${transactionDB.attributes.TRANSACTION_DATE},'YYYY-MM-DD') as ${transactionDB.attributes.TRANSACTION_DATE},
            ${transactionDB.attributes.PAYMENT_METHOD},
            ${transactionDB.attributes.TRANSACTION_AMOUNT},
            ${transactionDB.foreignKey.CREDENTIAL_ID};`;

    logger(loggingLevel.DEBUG, `Executing INSERT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `INSERT query on table {0} executed successfully.`, transactionDB.TABLE_NAME);
        return res.rows[0];
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function deleteTransactionDB(id, transactionDB, userId) {
    const filter = getFilter(userId, `${transactionDB.attributes.TRANSACTION_ID} = '${id}'`);
    const query = `DELETE FROM ${transactionDB.TABLE_NAME} ${filter}
            RETURNING ${transactionDB.attributes.TRANSACTION_ID},
            ${transactionDB.attributes.TRANSACTION_TYPE},
            ${transactionDB.attributes.TRANSACTION_DESCRIPTION},
            to_char(${transactionDB.attributes.TRANSACTION_DATE},'YYYY-MM-DD') as ${transactionDB.attributes.TRANSACTION_DATE},
            ${transactionDB.attributes.PAYMENT_METHOD},
            ${transactionDB.attributes.TRANSACTION_AMOUNT},
            ${transactionDB.foreignKey.CREDENTIAL_ID};`;

    logger(loggingLevel.DEBUG, `Executing DELETE query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `DELETE query on table {0} executed successfully.`, transactionDB.TABLE_NAME);
        return res.rows[0];
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}