import pg from "pg";
import { logger } from "../utility/loggerService.js";
import config from "../configuration/config.js";

const loggingLevel = config.loggingLevel;

const MAX_RETRIES = process.env.DB_CONN_MAX_RETRIES;
const RETRY_DELAY_MS = process.env.DB_CONN_RETRY_DELAY_MS;

//local DB setup: 
// - create a new database "sparc" in local PostgreSQL server
// - create a superuser with username PG_USER and password PG_PASSWORD
const db = new pg.Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT
});

async function connectWithRetry() {
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            attempt++;
            logger(loggingLevel.INFO, "Attempting DB connection (attempt {0})...", attempt);

            await db.connect();

            logger(loggingLevel.INFO, "Connected to PostgreSQL successfully.");

            await db.query(`SET TIME ZONE '${process.env.POSTGRES_TIMEZONE}'`);
            logger(loggingLevel.INFO, "Postgres server time zone set to {0}.", process.env.POSTGRES_TIMEZONE);

            return; 
        } catch (err) {
            logger(loggingLevel.ERROR, "DB connection failed (attempt {0}): {1}", attempt, err.message);

            if (attempt >= MAX_RETRIES) {
                logger(loggingLevel.ERROR, "Max DB retry attempts reached. Exiting...");
                process.exit(1); 
            }

            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
    }
}

await connectWithRetry();

export default db;