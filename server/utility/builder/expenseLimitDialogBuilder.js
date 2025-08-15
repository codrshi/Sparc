import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function buildExpenseLimitDialogMessage(monthlyAmountWithLimits) {
    let map = new Map();

    monthlyAmountWithLimits.forEach(monthlyAmountWithLimit => {

        if (monthlyAmountWithLimit.month >= monthlyAmountWithLimit.creationMonth) {
            let severity = null;

            if (Math.abs(monthlyAmountWithLimit.amount) >= monthlyAmountWithLimit.amountLimit)
                severity = config.expenseLimit.EXPENSE_LIMIT_EXCEEDING;
            else if (Math.abs(monthlyAmountWithLimit.amount) >= config.expenseLimit.EXPENSE_LIMIT_WARN_FRACTION * monthlyAmountWithLimit.amountLimit)
                severity = config.expenseLimit.EXPENSE_LIMIT_APPROACHING;

            if (severity !== null && !isDuplicateKey(map, { type: monthlyAmountWithLimit.type, month: monthlyAmountWithLimit.month })) {
                map.set({ type: monthlyAmountWithLimit.type, month: monthlyAmountWithLimit.month }, severity);
            }
        }
    })

    if (map.size === 0)
        return null;

    const messagesMap = new Map();

    map.forEach((severity, TypeMonthKey) => {

        const key = getMonthKey(TypeMonthKey.month);
        if (!messagesMap.has(key)) {
            messagesMap.set(key, { [config.expenseLimit.EXPENSE_LIMIT_APPROACHING]: [], [config.expenseLimit.EXPENSE_LIMIT_EXCEEDING]: [] });
        }
        messagesMap.get(key)[severity].push(TypeMonthKey.type);
    });

    let resultMessage = [];
    messagesMap.forEach((value, key) => {
        Object.entries(value).forEach(([severity, types]) => {
            if (types.length > 0)
                resultMessage.push("You are " + severity + " your monthly expense limit for " + types.join(", ") + " for the month of " + key + ".");
        })
    });

    logger(config.loggingLevel.DEBUG, `Expense limit dialog message: {0}`, resultMessage.join("\n"));

    return resultMessage.join("\n");
}

function getMonthKey(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return config.monthNames[parseInt(month) - 1] + ", " + year;
}

function isDuplicateKey(map, newKey) {
    for (let key of map.keys()) {
        if (key.type === newKey.type && key.month === newKey.month) {
            return true;
        }
    }
    return false;
}


export default buildExpenseLimitDialogMessage;