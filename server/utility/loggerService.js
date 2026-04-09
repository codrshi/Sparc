import config from "../configuration/config.js";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
dotenv.config({path: path.join(__dirname, `../.env.${process.env.NODE_ENV}`)});

const LOGGING_LEVEL_LOOKUP = new Map([
    [config.loggingLevel.DEBUG, 0],
    [config.loggingLevel.INFO, 1],
    [config.loggingLevel.WARN, 2],
    [config.loggingLevel.ERROR, 3]
]);

const ACTIVE_LOGGING_TYPE = LOGGING_LEVEL_LOOKUP.has(process.env.LOG_LEVEL)? process.env.LOG_LEVEL: config.loggingLevel.INFO;
const ACTIVE_LOGGING_LEVEL = LOGGING_LEVEL_LOOKUP.get(ACTIVE_LOGGING_TYPE);

console.log(`Logging level is set to ${ACTIVE_LOGGING_TYPE}`);

export const logger = (logType, message, ...params) => {
    if (LOGGING_LEVEL_LOOKUP.has(logType) && LOGGING_LEVEL_LOOKUP.get(logType) < ACTIVE_LOGGING_LEVEL) {
        return;
    }

    message = params.reduce((message, param, index) => message.replace(`{${index}}`, param), message);

    const err = new Error();
    const stackLines = err.stack.split('\n');

    const callerLine = stackLines[2] || '';

    const match = callerLine.match(/\s+at\s+(.*)\s+\((.*):(\d+):(\d+)\)/) ||
        callerLine.match(/\s+at\s+(.*):(\d+):(\d+)/);

    let locationInfo = '';
    if (match) {
        if (match.length === 5) {
            const [, method, file, line, col] = match;
            locationInfo = `${file}:${line}:${col} (${method})`;
        } else if (match.length === 4) {
            const [, file, line, col] = match;
            locationInfo = `${file}:${line}:${col}`;
        }
    }

    const timestamp = new Date().toISOString();
    const loggerfinalMessage = `[${timestamp}] [${logType}] ${locationInfo}: ${message}`;

    switch (logType) {
        case config.loggingLevel.INFO: console.info(loggerfinalMessage);
            break;
        case config.loggingLevel.DEBUG:
            console.debug(loggerfinalMessage);
            break;
        case config.loggingLevel.WARN: console.warn(loggerfinalMessage);
            break;
        case config.loggingLevel.ERROR: console.error(loggerfinalMessage);
            break;
        default:
            console.log(`[${timestamp}] [DEFAULT] ${locationInfo}: ${message}`);
    }
};