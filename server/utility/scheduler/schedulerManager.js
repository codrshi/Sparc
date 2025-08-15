import { getCredential } from "../../controller/LoginController.js";
import cron from 'node-cron';
import plimit from 'p-limit';
import config from "../../configuration/config.js";
import accumulateEmergencyFundJob from "./accumulateEmergencyFundScheduler.js";
import populateRecurringTransactionJob from "./addRecurringTransactionScheduler.js";
import populateMonthlyExpenseAggregateJob from "./populateMonthlyExpenseAggregateScheduler.js";
import exportExpenseReportJob from "./exportExpenseReportScheduler.js";
import { logger } from "../loggerService.js";

const ACCUMULATE_EMERGENCY_FUND_JOB = "accumulateEmergencyFundJob";
const POPULATE_RECURRING_TRANSACTION_JOB = "populateRecurringTransactionJob";
const POPULATE_MONTHLY_EXPENSE_AGGREGATE_JOB = "populateMonthlyExpenseAggregateJob";
const EXPORT_EXPENSE_REPORT_JOB = "exportExpenseReportJob";

const jobsLimit = plimit(config.scheduler.MAX_CONCURRENT_JOBS);

const loggingLevel = config.loggingLevel;

async function triggerScheduler() {

    cron.schedule('0 0 * * *', async () => { //0 0 * * *
        const credentials = await getCredential(config.db.NO_CONDITION);

        if (credentials.length === 0)
            return;

        const now = new Date();
        const isFirstOfMonth = now.getDate() === 1;

        logger(loggingLevel.INFO, `Scheduler started executing jobs for date = {0}`, now.toLocaleDateString('en-CA'));

        const parallelJobsToExecute = [];
        if (isFirstOfMonth)
            parallelJobsToExecute.push([POPULATE_MONTHLY_EXPENSE_AGGREGATE_JOB, ACCUMULATE_EMERGENCY_FUND_JOB, EXPORT_EXPENSE_REPORT_JOB]);

        parallelJobsToExecute.push([POPULATE_RECURRING_TRANSACTION_JOB]);

        logger(loggingLevel.DEBUG, `Jobs to execute: {0}`, parallelJobsToExecute.map(jobs => jobs.join(", ")).join(" | "));

        for (const parallelJobs of parallelJobsToExecute) {
            logger(loggingLevel.INFO, `Execution of job(s) = {0} started.`, parallelJobs.join(", "));

            const jobsPromises = parallelJobs.map(job => jobsLimit(() => mapJob(job, credentials)));
            await Promise.all(jobsPromises);

            logger(loggingLevel.INFO, `Execution of job(s) = {0} finished.`, parallelJobs.join(", "));
        }

        logger(loggingLevel.INFO, `Scheduler finished executing jobs for date = {0}`, now.toLocaleDateString('en-CA'));
    });
}

async function mapJob(job, credentials) {
    switch (job) {
        case ACCUMULATE_EMERGENCY_FUND_JOB:
            await accumulateEmergencyFundJob();
            break;
        case POPULATE_RECURRING_TRANSACTION_JOB:
            await populateRecurringTransactionJob();
            break;
        case POPULATE_MONTHLY_EXPENSE_AGGREGATE_JOB:
            await populateMonthlyExpenseAggregateJob(credentials);
            break;
        case EXPORT_EXPENSE_REPORT_JOB:
            await exportExpenseReportJob(credentials);
            break;
        default:
            logger(loggingLevel.WARN, `Encountered unknown job ID = {0}.`, job);
            break;
    }
}

export default triggerScheduler;