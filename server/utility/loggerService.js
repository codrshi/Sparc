import config from "../configuration/config.js";
import dotenv from "dotenv";

dotenv.config();

export const loggingDegree = {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
};

const env = process.env.NODE_ENV || config.node_env.DEVELOPMENT;
export const ACTIVE_LOG_LEVEL = env === config.node_env.PRODUCTION
    ? loggingDegree.INFO
    : loggingDegree.DEBUG;

export const logger = (level, message, ...params) => {
    if (level < ACTIVE_LOG_LEVEL) {
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
    const loggerfinalMessage = `[${timestamp}] [${level}] ${locationInfo}: ${message}`;

    switch (level) {
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