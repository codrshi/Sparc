import config from '../../configuration/config.js';
import plimit from 'p-limit';
import { Worker } from 'worker_threads';
import { logger } from '../loggerService.js';

const workerLimit = plimit(config.scheduler.MAX_CONCURRENT_WORKERS_PER_USER);
const loggingLevel = config.loggingLevel;

async function populateMonthlyExpenseAggregateJob(credentials) {

    try {
        logger(loggingLevel.INFO, "populate-monthly-expense-aggregate-job started....");

        const workers = credentials.map(credential => {
            return workerLimit(() => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker('./utility/scheduler/worker/populateMonthlyExpenseAggregateWorker.js', {
                        workerData: {
                            userId: credential.id
                        }
                    });
                    worker.on('message', resolve);      // Get result from worker
                    worker.on('error', reject);         // Catch errors
                    worker.on('exit', (code) => {
                        if (code !== 0)
                            reject(new Error(`Worker stopped with exit code ${code}`));
                    });
                });
            })
        }
        );

        await Promise.all(workers);
    }
    catch (error) {
        logger(loggingLevel.ERROR, "populate-monthly-expense-aggregate-job failed with error: {0}", error);
        throw error;
    }
    finally {
        logger(loggingLevel.INFO, "populate-monthly-expense-aggregate-job finished.");
    }
}

export default populateMonthlyExpenseAggregateJob;