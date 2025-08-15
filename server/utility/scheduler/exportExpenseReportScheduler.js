
import config from '../../configuration/config.js';
import plimit from 'p-limit';
import { Worker } from 'worker_threads';
import { logger } from '../loggerService.js';

const workerLimit = plimit(config.scheduler.MAX_CONCURRENT_WORKERS_PER_USER);
const loggingLevel = config.loggingLevel;

async function exportExpenseReportJob(credentials) {
    try {
        logger(loggingLevel.INFO, "export-expense-report-job started....");

        const workers = credentials.filter(credential => credential.isExportReportEnabled === true).map(credential => {
            return workerLimit(() => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker('./utility/scheduler/worker/exportExpenseReportWorker.js', {
                        workerData: {
                            credential: credential
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
        logger(loggingLevel.ERROR, "export-expense-report-job failed with error: {0}", error);
        throw error;
    }
    finally {
        logger(loggingLevel.INFO, "export-expense-report-job finished.");
    }
}

export default exportExpenseReportJob;