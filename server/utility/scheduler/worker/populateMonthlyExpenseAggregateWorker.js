import { parentPort, workerData } from "worker_threads";
import { populateMonthlyExpenseAggregate } from "../../../controller/UtilController.js";
import config from "../../../configuration/config.js";
import { logger } from "../../loggerService.js";

const loggingLevel = config.loggingLevel;

async function executeWorker() {
    const { userId } = workerData.recurringTransactions;
    logger(loggingLevel.INFO, `export-expense-report-job worker for userId = ${userId} started...`);

    try {
        await populateMonthlyExpenseAggregate(userId);
    }
    catch (error) {
        logger(loggingLevel.ERROR, `export-expense-report-job worker for userId = ${userId} failed with error: ${error}`);
        parentPort.postMessage({ success: false, error: error.message });
    }

    logger(loggingLevel.INFO, `export-expense-report-job worker for userId = ${userId} finished.`);
    parentPort.postMessage({ success: true });
}

executeWorker();