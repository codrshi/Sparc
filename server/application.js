import express from "express";
import db from "./repository/serverDB.js";
import { fileURLToPath } from 'url';
import path from 'path';
import myTransactionRouter from "./route/MyTransactionRoute.js";
import manageExpensesRouter from "./route/ManageExpensesRoute.js";
import monthlySummaryRouter from "./route/MonthlySummaryRoute.js";
import dashboardRouter from "./route/DashboardRoute.js";
import loginRouter from "./route/LoginRoute.js";
import settingsRouter from "./route/SettingsRoute.js";
import financialAdvisorRouter from "./route/FinancialAdvisorRoute.js";
import cors from "cors";
import { initializeDB } from "./repository/dbUtil.js";
import dotenv from "dotenv";
import fs from "fs";
import config from "./configuration/config.js";
import cookieParser from "cookie-parser";
import triggerScheduler from "./utility/scheduler/schedulerManager.js";
import { logger } from "./utility/loggerService.js";
import MissingParameterException from "./exception/MissingParameterException.js";
import InvalidParameterException from "./exception/InvalidParameterException.js";
import ExpiredTokenException from "./exception/ExpiredTokenException.js";
import MissingEntryDBException from "./exception/MissingEntryDBException.js";
import UnknownTableException from "./exception/UnknownTableException.js";

const loggingLevel = config.loggingLevel;
dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(
    cors({
        origin: `http://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}`, // Allow only the client to connect
        credentials: true, // Allow cookies and authorization headers
        methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    })
);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'template'));
app.use("/uploads", express.static("uploads"));

if (!fs.existsSync(config.uploadPath)) {
    logger(loggingLevel.INFO, "Creating {0} directory...", config.uploadPath);
    fs.mkdirSync(config.uploadPath, { recursive: true });
    logger(loggingLevel.INFO, "Created {0} directory successfully.", config.uploadPath);
}

const checkDBConnection = async () => {
    logger(loggingLevel.INFO, "Checking database connection...");
    try {
        await db.query("SELECT 1");
        logger(loggingLevel.INFO, "Database connection is active.");
        initializeDB();
        return true;
    } catch (error) {
        console.error("Database connection lost:", error);
        return false;
    }
};

checkDBConnection();

logger(loggingLevel.INFO, "Wiring up routes...");
app.use("/", myTransactionRouter);
app.use("/", manageExpensesRouter);
app.use("/", monthlySummaryRouter);
app.use("/", dashboardRouter);
app.use("/", loginRouter);
app.use("/", settingsRouter);
app.use("/", financialAdvisorRouter);
logger(loggingLevel.INFO, "Routes wired up successfully.");

app.use((err, req, res, next) => {
    if (err instanceof MissingParameterException) {
        logger(loggingLevel.ERROR, "Validation of request failed for {0} endpoint: {1} parameter is missing.\n{2}", err.endpoint, err.missingParam, err.stack);
        res.status(400).json({ error: err.message });
    }
    else if (err instanceof InvalidParameterException) {
        logger(loggingLevel.ERROR, "Validation of request failed for {0} endpoint: {1} parameter has invalid value = {2}.\n{3}", err.endpoint, err.invalidParam, err.invalidValue, err.stack);
        res.status(400).json({ error: err.message });
    }
    else if (err instanceof ExpiredTokenException) {
        logger(loggingLevel.ERROR, "Authorization failed for {0} endpoint: {1} is invalid or expired.\n{3}", err.endpoint, err.invalidParam, err.stack);
        res.status(401).json({ error: err.message });
    }
    else if (err instanceof MissingEntryDBException) {
        logger(loggingLevel.ERROR, `Database Entry not found. table = {0}, user ID = {1}`, err.tableName, err.userId);
        res.status(400).json({ error: err.message });
    }
    else if (err instanceof UnknownTableException) {
        logger(loggingLevel.ERROR, `Wrong table = {0} encountered.`, err.unknownTable);
        res.status(400).json({ error: "Database error occurred. Please try again later." });
    }
    else {
        logger(loggingLevel.ERROR, `Unknown error occured: ${err.name}: ${err.message} \n ${err.stack}`);
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
    /*
    200 OK – success

    400 Bad Request – invalid input

    401 Unauthorized – not logged in or token invalid

    403 Forbidden – authenticated but not allowed

    404 Not Found – resource not found

    500 Internal Server Error – generic server failure
    */
});

triggerScheduler();

process.on("SIGINT", async () => {
    logger(loggingLevel.INFO, "Received SIGINT signal. Shutting down server gracefully...");
    try {
        logger(loggingLevel.INFO, "Closing database connection...");
        await db.end();
        logger(loggingLevel.INFO, "Closed database connection successfully.");
    } catch (err) {
        console.error("Error disconnecting from database:", err.stack);
    }

    process.exit(0);

});

export default app;