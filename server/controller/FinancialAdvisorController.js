import { log } from "console";
import config from "../configuration/config.js";
import { decrementCreditsDB } from "../repository/query/credentialQuery.js";
import getAiResponse from "../utility/builder/aiResponseGenerator.js";
import splitIntoMonthlyIntervals from "../utility/dateRangeMonthlySplitter.js";
import { logger } from "../utility/loggerService.js";
import credentialDBToDTOmapper from "../utility/mapper/credentialDBToDTOMapper.js";
import { getCredential } from "./LoginController.js";
import { getMonthlySummaryForInterval } from "./MonthlySummaryController.js";
import MissingEntryDBException from "../exception/MissingEntryDBException.js";

const loggingLevel = config.loggingLevel;

export async function getAdvice(startDate, endDate, userId) {
    startDate = new Date(startDate);
    endDate = new Date(endDate);

    logger(loggingLevel.INFO, `Generating financial advice for user ID = {0} for transactions in date range: {1} to {2}`, userId, startDate.toLocaleDateString('en-CA'), endDate.toLocaleDateString('en-CA'));
    const monthlyIntervals = splitIntoMonthlyIntervals(startDate, endDate);
    const monthlySummaries = new Map();

    for (const interval of monthlyIntervals) {
        const summary = await getMonthlySummaryForInterval(interval.start, interval.end, userId);
        if (summary) {
            const monthKey = `${interval.start.toLocaleDateString('en-CA')} to ${interval.end.toLocaleDateString('en-CA')}`;
            monthlySummaries.set(monthKey, summary);
            logger(loggingLevel.DEBUG, `Monthly summary entry inserted for interval key = {0}`, monthKey);
        }
    }

    if (monthlySummaries.size === 0) {
        logger(loggingLevel.INFO, `No transactions found for the selected date range`);
        return {
            advice: "No transactions found for the selected date range.",
            credits: null
        };
    }

    const advice = JSON.stringify(monthlySummaries);
    //const advice = await getAiResponse(monthlySummaries, startDate, endDate);
    const credentialsDB = await decrementCreditsDB(`${config.db.tables.credential.attributes.CREDITS_LEFT} - 1`, userId);

    if (!credentialsDB || credentialsDB == undefined || credentialsDB == null || credentialsDB.length === 0) {
        throw new MissingEntryDBException(config.db.tables.credential.TABLE_NAME, userId);
    }

    logger(loggingLevel.INFO, `Financial advice generated: {0}`, advice);
    logger(loggingLevel.INFO, `Credits left after advice generation: {0}`, credentialsDB[0].creditsLeft);

    return {
        advice: advice,
        credits: credentialDBToDTOmapper(credentialsDB[0]).creditsLeft
    };
}

export async function getCredits(userId) {
    const credentials = await getCredential(`WHERE ${config.db.tables.credential.attributes.ID} = '${userId}'`);

    if (!credentials || credentials == undefined || credentials == null || credentials.length === 0) {
        throw new MissingEntryDBException(config.db.tables.credential.TABLE_NAME, userId);
    }

    let prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

    logger(loggingLevel.INFO, `Credits left for user ID = {0}`, userId, credentials[0].creditsLeft);
    logger(loggingLevel.INFO, `Account creation date: {0}`, credentials[0].createdAt.toLocaleDateString('en-CA'));

    return {
        credits: credentials[0].creditsLeft,
        isNewAccount: credentials[0].createdAt < prevMonthDate,
    };
}