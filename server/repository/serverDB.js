import pg from "pg";
import dotenv from "dotenv";
import { logger } from "../utility/loggerService.js";
import config from "../configuration/config.js";

dotenv.config();
const loggingLevel = config.loggingLevel;

const db = new pg.Client({
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
});

db.connect(async (err) => {
    if (err) {
        logger(loggingLevel.ERROR, "Error connecting to the database: {0}", err);
        throw err;
    }
});

db.query(`SET TIME ZONE '${process.env.PG_TIMEZONE}'`);
logger(loggingLevel.INFO, "Postgres server time zone set to {0}.", process.env.PG_TIMEZONE);

export default db;