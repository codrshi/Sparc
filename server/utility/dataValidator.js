import config from "../configuration/config.js";
import InvalidParameterException from "../exception/InvalidParameterException.js";
import MissingParameterException from "../exception/MissingParameterException.js";

const ALLOWED_TRANSACTION_TYPES = new Set(Object.values(config.transactionTypes));
const ALLOWED_PAYMENT_METHODS = new Set(Object.values(config.paymentMethods));

String.prototype.format = function (...args) {
    return this.replace(/{(\d+)}/g, (match, index) => args[index]);
};

export function validateId(parameter, parameterName, endpoint) {
    checkIfParameterIsMissing(parameter, parameterName, endpoint);
}

export function validateBoolean(parameter, parameterName, endpoint) {
    checkIfParameterIsMissing(parameter, parameterName, endpoint);

    if (isBooleanInvalid(parameter)) {
        throw new InvalidParameterException(parameterName, parameter, endpoint);
    }
}

export function validateDate(date, parameterName, endpoint) {
    checkIfParameterIsMissing(date, parameterName, endpoint);

    if (isDateInvalid(date)) {
        throw new InvalidParameterException(parameterName, date, endpoint);
    }
}

export function validateToken(token, parameterName, endpoint) {
    checkIfParameterIsMissing(token, parameterName, endpoint);
}

export function validateBooleanString(value, parameterName, endpoint) {
    checkIfParameterIsMissing(value, parameterName, endpoint);

    if (value.toLowerCase() !== "true" && value.toLowerCase() !== "false") {
        throw new InvalidParameterException(parameterName, value, endpoint);
    }
}

export function validateDateRange(startDate, endDate, endpoint) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
        const invalidValue = `${config.parameters.START_DATE} = ${startDate} is after ${config.parameters.END_DATE} = ${endDate}`;
        throw new InvalidParameterException([config.parameters.START_DATE, config.parameters.END_DATE], invalidValue, endpoint);
    }
}

export function validateNumber(value, parameterName, endpoint) {
    if (isNaN(value) || parseFloat(value) < 0) {
        throw new InvalidParameterException(parameterName, value, endpoint);
    }
}

function checkIfParameterIsMissing(parameter, parameterName, endpoint) {
    if (!parameter || parameter === undefined || parameter === null) {
        throw new MissingParameterException(parameterName, endpoint);
    }
}

function isDateInvalid(date) {

    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(date)) {
        return true;
    }

    try {
        const parsedDate = new Date(date);
        const [year, month, day] = date.split("-").map(Number);

        if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() !== year ||
            parsedDate.getMonth() + 1 !== month || parsedDate.getDate() !== day) {

            return true;
        }
    } catch (error) {
        return true;
    }
    return false;
}

function isBooleanInvalid(value) {
    if ((typeof value !== 'boolean') ||
        (typeof value === 'string' && value !== 'true' && value !== 'false')) {
        return true;
    }
    return false;
}


export function validateExpenseLimits(expenseLimits, endpoint) {

    const invalidFields = [];
    const missingFields = [];
    const invalidValues = [];
    var index = 0;

    for (const expenseLimit of expenseLimits) {
        if (expenseLimit.type === undefined || expenseLimit.type === null) {
            missingFields.push(config.parameters.EXPENSE_LIMIT_TYPE.format(index));
        } else if (!ALLOWED_TRANSACTION_TYPES.has(expenseLimit.type) && expenseLimit.type !== config.expenseLimit.TOTAL_EXPENSE_LIMIT) {
            invalidFields.push(config.parameters.EXPENSE_LIMIT_TYPE.format(index));
            invalidValues.push(expenseLimit.type);
        }

        if (expenseLimit.isEnabled === undefined || expenseLimit.isEnabled === null) {
            missingFields.push(config.parameters.EXPENSE_LIMIT_IS_ENABLED.format(index));
        } else if (isBooleanInvalid(expenseLimit.isEnabled)) {
            invalidFields.push(config.parameters.EXPENSE_LIMIT_IS_ENABLED.format(index));
            invalidValues.push(expenseLimit.isEnabled);
        }

        if (expenseLimit.amountLimit === undefined || expenseLimit.amountLimit === null) {
            missingFields.push(config.parameters.EXPENSE_LIMIT_AMOUNT_LIMIT.format(index));
        }
        else if (isNaN(expenseLimit.amountLimit) || parseFloat(expenseLimit.amountLimit) < 0) {
            invalidFields.push(config.parameters.EXPENSE_LIMIT_AMOUNT_LIMIT.format(index));
            invalidValues.push(expenseLimit.amountLimit);
        }
        index++;
    }

    if (missingFields.length > 0) {
        throw new MissingParameterException(missingFields.join(","), endpoint);
    }
    if (invalidFields.length > 0) {
        throw new InvalidParameterException(invalidFields.join(","), invalidValues.join(","), endpoint);
    }
}

export function validateEmergencyFund(emergencyFund, endpoint) {
    const invalidFields = [];
    const missingFields = [];
    const invalidValues = [];

    if (emergencyFund.targetAmount === undefined || emergencyFund.targetAmount === null) {
        missingFields.push(config.parameters.EMERGENCY_FUND_TARGET_AMOUNT);
    } else if (isNaN(emergencyFund.targetAmount) || parseFloat(emergencyFund.targetAmount) < 0) {
        invalidFields.push(config.parameters.EMERGENCY_FUND_TARGET_AMOUNT);
        invalidValues.push(emergencyFund.targetAmount);
    }

    if (emergencyFund.percentageValue === undefined || emergencyFund.percentageValue === null) {
        missingFields.push(config.parameters.EMERGENCY_FUND_PERCENTAGE_VALUE);
    } else if (isNaN(emergencyFund.percentageValue) || parseFloat(emergencyFund.percentageValue) < 0 || parseFloat(emergencyFund.percentageValue) > 100) {
        invalidFields.push(config.parameters.EMERGENCY_FUND_PERCENTAGE_VALUE);
        invalidValues.push(emergencyFund.percentageValue);
    }

    if (emergencyFund.amount === undefined || emergencyFund.amount === null) {
        missingFields.push(config.parameters.EMERGENCY_FUND_AMOUNT);
    }
    else if (isNaN(emergencyFund.amount) || parseFloat(emergencyFund.amount) < 0) {
        invalidFields.push(config.parameters.EMERGENCY_FUND_AMOUNT);
        invalidValues.push(emergencyFund.amount);
    }

    if (emergencyFund.isEnabled === undefined || emergencyFund.isEnabled === null) {
        missingFields.push(config.parameters.EMERGENCY_FUND_IS_ENABLED);
    }
    else if (isBooleanInvalid(emergencyFund.isEnabled)) {
        invalidFields.push(config.parameters.EMERGENCY_FUND_IS_ENABLED);
        invalidValues.push(emergencyFund.isEnabled);
    }

    if (emergencyFund.pastMonthCount === undefined || emergencyFund.pastMonthCount === null) {
        missingFields.push(config.parameters.EMERGENCY_FUND_PAST_MONTH_COUNT);
    } else if (isNaN(emergencyFund.pastMonthCount) || parseInt(emergencyFund.pastMonthCount) < 0) {
        invalidFields.push(config.parameters.EMERGENCY_FUND_PAST_MONTH_COUNT);
        invalidValues.push(emergencyFund.pastMonthCount);
    }

    if (emergencyFund.defaultTargetAmount === undefined || emergencyFund.defaultTargetAmount === null) {
        missingFields.push(config.parameters.EMERGENCY_FUND_DEFAULT_TARGET_AMOUNT);
    }
    else if (isNaN(emergencyFund.defaultTargetAmount) || parseFloat(emergencyFund.defaultTargetAmount) < 0) {
        invalidFields.push(config.parameters.EMERGENCY_FUND_DEFAULT_TARGET_AMOUNT);
        invalidValues.push(emergencyFund.defaultTargetAmount);
    }


    if (missingFields.length > 0) {
        throw new MissingParameterException(missingFields.join(","), endpoint);
    }
    if (invalidFields.length > 0) {
        throw new InvalidParameterException(invalidFields.join(","), invalidValues.join(","), endpoint);
    }
}

export function validateTransaction(transaction, endpoint) {
    const invalidFields = [];
    const missingFields = [];
    const invalidValues = [];

    if (transaction.type === undefined || transaction.type === null) {
        missingFields.push(config.parameters.TRANSACTION_TYPE);
    } else if (!ALLOWED_TRANSACTION_TYPES.has(transaction.type)) {
        invalidFields.push(config.parameters.TRANSACTION_TYPE);
        invalidValues.push(transaction.type);
    }

    if (transaction.amount === undefined || transaction.amount === null) {
        missingFields.push(config.parameters.TRANSACTION_AMOUNT);
    } else if (isNaN(transaction.amount) || parseFloat(transaction.amount) == 0) {
        invalidFields.push(config.parameters.TRANSACTION_AMOUNT);
        invalidValues.push(transaction.amount);
    }

    if (transaction.date === undefined || transaction.date === null) {
        missingFields.push(config.parameters.TRANSACTION_DATE);
    }
    else if (isDateInvalid(transaction.date)) {
        invalidFields.push(config.parameters.TRANSACTION_DATE);
        invalidValues.push(transaction.date);
    }

    if (transaction.description === undefined || transaction.description === null) {
        missingFields.push(config.parameters.TRANSACTION_DESCRIPTION);
    }
    else if (typeof transaction.description !== 'string') {
        invalidFields.push(config.parameters.TRANSACTION_DESCRIPTION);
        invalidValues.push(transaction.description);
    }

    if (transaction.paymentMethod === undefined || transaction.paymentMethod === null) {
        missingFields.push(config.parameters.TRANSACTION_PAYMENT_METHOD);
    }
    else if (!ALLOWED_PAYMENT_METHODS.has(transaction.paymentMethod)) {
        invalidFields.push(config.parameters.TRANSACTION_PAYMENT_METHOD);
        invalidValues.push(transaction.paymentMethod);
    }

    if (missingFields.length > 0) {
        throw new MissingParameterException(missingFields.join(","), endpoint);
    }
    if (invalidFields.length > 0) {
        throw new InvalidParameterException(invalidFields.join(","), invalidValues.join(","), endpoint);
    }
}