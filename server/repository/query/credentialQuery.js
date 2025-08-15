import config from "../../configuration/config.js";
import { logger } from "../../utility/loggerService.js";
import db from "../serverDB.js";

const credentialDB = config.db.tables.credential;
const loggingLevel = config.loggingLevel;

export async function createCredentialDB() {

    const query = `CREATE TABLE IF NOT EXISTS ${credentialDB.TABLE_NAME} (
            ${credentialDB.attributes.ID} TEXT PRIMARY KEY, 
            ${credentialDB.attributes.USERNAME} TEXT NOT NULL UNIQUE, 
            ${credentialDB.attributes.EMAIL} TEXT NOT NULL UNIQUE,
            ${credentialDB.attributes.PASSWORD_WITH_SALT} TEXT NOT NULL,
            ${credentialDB.attributes.HASHING_ROUNDS} INT NOT NULL DEFAULT ${config.hashingRounds.MIN_VALUE},
            ${credentialDB.attributes.CREATED_AT} TIMESTAMP DEFAULT NOW(),
            ${credentialDB.attributes.IS_TIP_ENABLED} BOOLEAN DEFAULT TRUE,
            ${credentialDB.attributes.IS_EXPORT_REPORT_ENABLED} BOOLEAN DEFAULT TRUE,
            ${credentialDB.attributes.PROFILE_PICTURE_PATH} TEXT,
            ${credentialDB.attributes.CREDITS_LEFT} INT DEFAULT ${config.MAX_CREDITS}
            );`;

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

export async function addCredentialDB(credential) {
    const query = `INSERT INTO ${credentialDB.TABLE_NAME}(
            ${credentialDB.attributes.ID},
            ${credentialDB.attributes.USERNAME},
            ${credentialDB.attributes.PASSWORD_WITH_SALT},
            ${credentialDB.attributes.HASHING_ROUNDS},
            ${credentialDB.attributes.EMAIL},
            ${credentialDB.attributes.PROFILE_PICTURE_PATH})
            VALUES ('${credential.id}',
                    '${credential.username}',
                    '${credential.passwordWithSalt}',
                    ${credential.hashingRounds},
                    '${credential.email}',
                    '${credential.profilePicturePath}')
            RETURNING *;`;

    logger(loggingLevel.DEBUG, `Executing INSERT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `INSERT query on table {0} executed successfully.`, credentialDB.TABLE_NAME);
        return res.rows[0];
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function getCredentialDB(condition) {
    const query = `SELECT * FROM ${credentialDB.TABLE_NAME} ${condition};`
    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, credentialDB.TABLE_NAME);
        return res.rows;
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function updateCredentialDB(credential) {
    const query = `UPDATE ${credentialDB.TABLE_NAME}
                        SET ${credentialDB.attributes.USERNAME} = '${credential.username}',
                            ${credentialDB.attributes.EMAIL} = '${credential.email}',
                            ${credentialDB.attributes.PASSWORD_WITH_SALT}='${credential.passwordWithSalt}',
                            ${credentialDB.attributes.HASHING_ROUNDS}=${credential.hashingRounds},
                            ${credentialDB.attributes.IS_TIP_ENABLED}=${credential.isTipEnabled},
                            ${credentialDB.attributes.IS_EXPORT_REPORT_ENABLED}=${credential.isExportReportEnabled},
                            ${credentialDB.attributes.PROFILE_PICTURE_PATH} = '${credential.profilePicturePath}'
                        WHERE ${credentialDB.attributes.ID} = '${credential.id}'
                        RETURNING *;`;

    logger(loggingLevel.DEBUG, `Executing UPDATE query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `UPDATE query on table {0} executed successfully.`, credentialDB.TABLE_NAME);
        return res.rows[0];
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function deleteCredentialDB(id) {
    const query = `DELETE FROM ${credentialDB.TABLE_NAME}
            WHERE ${credentialDB.attributes.ID} = '${id}'
            RETURNING *;`;

    logger(loggingLevel.DEBUG, `Executing DELETE query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `DELETE query on table {0} executed successfully.`, credentialDB.TABLE_NAME);
        return res.rows[0];
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function changePasswordCredentialDB(passwordWithSalt, hashingRounds, email) {
    const query = `UPDATE ${credentialDB.TABLE_NAME} SET
                            ${credentialDB.attributes.PASSWORD_WITH_SALT}='${passwordWithSalt}',
                            ${credentialDB.attributes.HASHING_ROUNDS}=${hashingRounds}
                        WHERE ${credentialDB.attributes.EMAIL} = '${email}'
                        RETURNING *;`;

    logger(loggingLevel.DEBUG, `Executing UPDATE query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `UPDATE query on table {0} executed successfully.`, credentialDB.TABLE_NAME);
        return res.rows[0];
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function decrementCreditsDB(newValue, id) {

    const query = `UPDATE ${credentialDB.TABLE_NAME} SET
            ${credentialDB.attributes.CREDITS_LEFT} = GREATEST(${newValue}, 0)
            WHERE ${credentialDB.attributes.ID} = '${id}'
            RETURNING ${credentialDB.attributes.CREDITS_LEFT};`;

    logger(loggingLevel.DEBUG, `Executing UPDATE query: {0}`, query);

    try {
        const res = await db.query(query);

        logger(loggingLevel.INFO, `UPDATE query on table {0} executed successfully.`, credentialDB.TABLE_NAME);
        return res.rows;
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}
