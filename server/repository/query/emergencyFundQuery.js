import config from "../../configuration/config.js";
import { logger } from "../../utility/loggerService.js";
import { getFilter } from "../dbUtil.js";
import db from "../serverDB.js";

const emergencyFundDB = config.db.tables.emergencyFund;
const credentialDB = config.db.tables.credential;
const loggingLevel = config.loggingLevel;

export async function createEmergencyFundDB() {

    const query = `CREATE TABLE IF NOT EXISTS ${emergencyFundDB.TABLE_NAME} (
            ${emergencyFundDB.attributes.IS_ENABLED} BOOLEAN NOT NULL DEFAULT FALSE, 
            ${emergencyFundDB.attributes.AMOUNT} NUMERIC NOT NULL DEFAULT 0,
            ${emergencyFundDB.attributes.TARGET_AMOUNT} NUMERIC NOT NULL DEFAULT 0,
            ${emergencyFundDB.attributes.DEFAULT_TARGET_AMOUNT} NUMERIC NOT NULL DEFAULT 0,
            ${emergencyFundDB.attributes.PERCENTAGE_VALUE} NUMERIC NOT NULL CHECK (${emergencyFundDB.attributes.PERCENTAGE_VALUE} BETWEEN 1 AND 100),
            ${emergencyFundDB.attributes.PAST_MONTH_COUNT} NUMERIC NOT NULL DEFAULT 0,
            ${emergencyFundDB.foreignKey.CREDENTIAL_ID} TEXT NOT NULL,
            FOREIGN KEY (${emergencyFundDB.foreignKey.CREDENTIAL_ID}) REFERENCES ${credentialDB.TABLE_NAME}(${credentialDB.attributes.ID}) ON DELETE CASCADE );`;

    logger(loggingLevel.DEBUG, `Executing CREATE query:  {0}`, query);
    try {
        await db.query(query);
        logger(loggingLevel.INFO, `CREATE query on table {0} executed successfully.`, emergencyFundDB.TABLE_NAME);
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}

export async function addEmergencyFundDB(emergencyFund, userId) {
    const query = `INSERT INTO ${emergencyFundDB.TABLE_NAME}(
            ${emergencyFundDB.attributes.IS_ENABLED}, 
            ${emergencyFundDB.attributes.AMOUNT},
            ${emergencyFundDB.attributes.TARGET_AMOUNT},
            ${emergencyFundDB.attributes.PERCENTAGE_VALUE},
            ${emergencyFundDB.attributes.PAST_MONTH_COUNT},
            ${emergencyFundDB.foreignKey.CREDENTIAL_ID})
            VALUES (${emergencyFund.isEnabled}, 
                    '${emergencyFund.amount}', 
                    '${emergencyFund.targetAmount}',
                    '${emergencyFund.percentageValue}',
                    '${emergencyFund.pastMonthCount}',
                    '${userId}')
            RETURNING *;`;

    logger(loggingLevel.DEBUG, `Executing INSERT query: {0}`, query);

    try {
        const res = await db.query(query);
        logger(loggingLevel.INFO, `INSERT query on table {0} executed successfully.`, emergencyFundDB.TABLE_NAME);

        return res.rows[0];
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function getEmergencyFundDB(condition, userId) {
    const filter = getFilter(userId, condition);
    const query = `SELECT * FROM ${emergencyFundDB.TABLE_NAME} ${filter};`;

    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, emergencyFundDB.TABLE_NAME);
        return res.rows;
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function updateEmergencyFundDB(emergencyFund, userId) {

    const filter = getFilter(userId, config.db.NO_CONDITION);
    const query = `UPDATE ${emergencyFundDB.TABLE_NAME}
                        SET ${emergencyFundDB.attributes.AMOUNT} = ${emergencyFund.amount},
                            ${emergencyFundDB.attributes.IS_ENABLED} = ${emergencyFund.isEnabled},
                            ${emergencyFundDB.attributes.PAST_MONTH_COUNT}=${emergencyFund.pastMonthCount},
                            ${emergencyFundDB.attributes.PERCENTAGE_VALUE}=${emergencyFund.percentageValue},
                            ${emergencyFundDB.attributes.TARGET_AMOUNT}=${emergencyFund.targetAmount},
                            ${emergencyFundDB.attributes.DEFAULT_TARGET_AMOUNT}=${emergencyFund.defaultTargetAmount}
                        ${filter}
                        RETURNING *;`;

    logger(loggingLevel.DEBUG, `Executing UPDATE query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `UPDATE query on table {0} executed successfully.`, emergencyFundDB.TABLE_NAME);
        return res.rows[0];
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function isEmergencyFundEmptyDB(userId) {

    const filter = getFilter(userId, config.db.NO_CONDITION);
    const query = `SELECT COUNT(*) FROM ${emergencyFundDB.TABLE_NAME} ${filter};`;

    try {
        const { rows } = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, emergencyFundDB.TABLE_NAME);
        return parseInt(rows[0].count) === 0;
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}