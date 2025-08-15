import config from "../../configuration/config.js";
import { logger } from "../../utility/loggerService.js";
import { getFilter } from "../dbUtil.js";
import db from "../serverDB.js";

const achievementDB = config.db.tables.achievement;
const credentialDB = config.db.tables.credential;
const loggingLevel = config.loggingLevel;

export async function createAchievementDB() {

    const query = `CREATE TABLE IF NOT EXISTS ${achievementDB.TABLE_NAME} (
            ${achievementDB.attributes.UNLOCK_MASK} NUMERIC NOT NULL DEFAULT 0,
            ${achievementDB.foreignKey.CREDENTIAL_ID} TEXT NOT NULL,
            FOREIGN KEY (${achievementDB.foreignKey.CREDENTIAL_ID}) REFERENCES ${credentialDB.TABLE_NAME}(${credentialDB.attributes.ID}) ON DELETE CASCADE );`

    logger(loggingLevel.DEBUG, `Executing CREATE query:  {0}`, query);
    try {
        await db.query(query);
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }

    logger(loggingLevel.INFO, `CREATE query on table {0} executed successfully.`, achievementDB.TABLE_NAME);
}

export async function isAchievementEmptyDB(userId) {
    const filter = getFilter(userId, config.db.NO_CONDITION);
    const query = `SELECT COUNT(*) FROM ${achievementDB.TABLE_NAME} ${filter};`
    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const { rows } = await db.query(query);

        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, achievementDB.TABLE_NAME);
        return parseInt(rows[0].count) === 0;
    }
    catch (err) {
        console.error("Error executing query: ", err.stack);
        throw err;
    }
}

export async function addAchievementDB(achievement, userId) {

    const query = `INSERT INTO ${achievementDB.TABLE_NAME}(
            ${achievementDB.attributes.UNLOCK_MASK}, ${achievementDB.foreignKey.CREDENTIAL_ID})
            VALUES ('${achievement.unlockMask}', '${userId}')
            RETURNING *;`
    logger(loggingLevel.DEBUG, `Executing INSERT query: {0}`, query);

    try {
        const res = await db.query(query);
        logger(loggingLevel.INFO, `INSERT query on table {0} executed successfully.`, achievementDB.TABLE_NAME);

        return res.rows[0];
    } catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function getAchievementDB(condition, userId) {
    const filter = getFilter(userId, condition)
    const query = `SELECT * FROM ${achievementDB.TABLE_NAME} ${filter};`
    logger(loggingLevel.DEBUG, `Executing SELECT query: {0}`, query);

    try {
        const res = await db.query(query);
        logger(loggingLevel.INFO, `SELECT query on table {0} executed successfully.`, achievementDB.TABLE_NAME);

        return res.rows[0];
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}

export async function updateAchievmentDB(newMask, userId) {
    const filter = getFilter(userId, config.db.NO_CONDITION);
    const query = `UPDATE ${achievementDB.TABLE_NAME}
                        SET ${achievementDB.attributes.UNLOCK_MASK} = ${newMask}
                        ${filter}
                        RETURNING *;`

    logger(loggingLevel.DEBUG, `Executing UPDATE query: {0}`, query);

    try {
        const res = await db.query(query);
        logger(loggingLevel.INFO, `UPDATE query on table {0} executed successfully.`, achievementDB.TABLE_NAME);
        return res.rows[0];
    }
    catch (err) {
        console.error("Error executing query", err.stack);
        throw err;
    }
}
