import { parentPort, workerData } from "worker_threads";
import { addTransaction } from '../../../controller/MyTransactionsController.js';
import { updateMonthlyExpenseAggregate } from '../../../controller/ManageExpensesController.js';
import config from "../../../configuration/config.js";
import { logger } from "../../loggerService.js";

const loggingLevel = config.loggingLevel;

async function executeWorker() {
    const { recurringTransactions, userId, dayOfMonth, lastDayOfMonth } = workerData;
    logger(loggingLevel.INFO, `populate-recurring-transaction-job worker for userId = ${userId} started...`);

    try {
        for (const recurringTransaction of recurringTransactions) {
            const transactionDayOfMonth = parseInt(recurringTransaction.date.split('-')[2]);

            if (transactionDayOfMonth === dayOfMonth)
                logger(loggingLevel.DEBUG, `recurring transaction day of month ${transactionDayOfMonth} is same as the day of month ${dayOfMonth}. No adjustment needed.`);
            else
                logger(loggingLevel.DEBUG, `recurring transaction day of month ${transactionDayOfMonth} is not same as the day of month ${dayOfMonth}. Adjusting the date to ${dayOfMonth}.`);

            recurringTransaction.date = new Date().toISOString().split('T')[0];
            const addedTransaction = await addTransaction(recurringTransaction, false, userId)
            logger(loggingLevel.DEBUG, `recurring transaction for user ID = {0}: {1}`, userId, JSON.stringify(addedTransaction, null, 2));

            await updateMonthlyExpenseAggregate(null, addedTransaction, userId, true);
        }
    }
    catch (error) {
        logger(loggingLevel.ERROR, `populate-recurring-transaction-job worker for userId = ${userId} failed with error: ${error}`);
        parentPort.postMessage({ success: false, error: error.message });
    }

    logger(loggingLevel.INFO, `populate-recurring-transaction-job worker for userId = ${userId} finished.`);
    parentPort.postMessage({ success: true });
}

executeWorker();