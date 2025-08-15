import config from '../../configuration/config.js';
import { getAllTransaction } from '../../controller/MyTransactionsController.js';
import plimit from 'p-limit';
import { Worker } from 'worker_threads';
import { logger } from '../loggerService.js';

const workerLimit = plimit(config.scheduler.MAX_CONCURRENT_WORKERS_PER_USER);
const transactionDB = config.db.tables.transaction;
const loggingLevel = config.loggingLevel;

async function populateRecurringTransactionJob() {
    logger(loggingLevel.INFO, "populate-recurring-transaction-job started....");

    const today = new Date();
    const dayOfMonth = today.getDate();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    try {
        const recurringTransactions = await getAllTransaction(getCondition(dayOfMonth, lastDayOfMonth), "", "", true, null);

        logger(loggingLevel.INFO, `Fetched {0} recurring transactions.`, recurringTransactions.length);

        if (recurringTransactions.length === 0)
            return;

        const groupedTrxByCredentialId = recurringTransactions.reduce((acc, row) => {
            const credentialId = row["credentialId"];
            if (!acc[credentialId]) {
                acc[credentialId] = [];
            }
            acc[credentialId].push(row);
            return acc;
        }, {});

        const workers = Object.entries(groupedTrxByCredentialId).map(([userId, recurringTransactions]) => {
            return workerLimit(() => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker('./utility/scheduler/worker/populateRecurringTransactionWorker.js', {
                        workerData: {
                            recurringTransactions: recurringTransactions,
                            userId: userId,
                            dayOfMonth: dayOfMonth,
                            lastDayOfMonth: lastDayOfMonth
                        }
                    });
                    worker.on('message', resolve);      // Get result from worker
                    worker.on('error', reject);         // Catch errors
                    worker.on('exit', (code) => {
                        if (code !== 0)
                            reject(new Error(`Worker stopped with exit code ${code}`));
                    });
                });
            });
        }
        );

        await Promise.all(workers);
    }
    catch (error) {
        logger(loggingLevel.ERROR, "populate-recurring-transaction-job failed with error: {0}", error);
        throw error;
    }
    finally {
        logger(loggingLevel.INFO, "populate-recurring-transaction-job finished.");
    }
}

function getCondition(dayOfMonth, lastDayOfMonth) {
    if (dayOfMonth === lastDayOfMonth)
        return `EXTRACT(DAY FROM ${transactionDB.attributes.TRANSACTION_DATE}) >= ${dayOfMonth}`;

    return `EXTRACT(DAY FROM ${transactionDB.attributes.TRANSACTION_DATE}) = ${dayOfMonth}`;
}

export default populateRecurringTransactionJob;
