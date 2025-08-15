import config from '../../configuration/config.js';
import { getEmergencyFund } from '../../controller/ManageExpensesController.js';
import plimit from 'p-limit';
import { Worker } from 'worker_threads';
import { logger } from '../loggerService.js';

const workerLimit = plimit(config.scheduler.MAX_CONCURRENT_WORKERS_PER_USER);
const loggingLevel = config.loggingLevel;

async function accumulateEmergencyFundJob() {

    try {
        logger(loggingLevel.INFO, "accumulate-emergency-fund-job started...");

        let emergencyFunds = await getEmergencyFund(config.db.NO_CONDITION, null);

        const workers = emergencyFunds.map(emergencyFund => {
            return workerLimit(() => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker('./utility/scheduler/worker/accumulateEmergencyFundWorker.js', {
                        workerData: {
                            emergencyFund: emergencyFund,
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
        logger(loggingLevel.ERROR, "accumulate-emergency-fund-job failed with error: {0}", error);
        throw error;
    }
    finally {
        logger(loggingLevel.INFO, "accumulate-emergency-fund-job finished.");
    }
}

export default accumulateEmergencyFundJob;