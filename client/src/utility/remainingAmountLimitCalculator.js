import config from "../configuration/config.js";
import { isAmountValid } from "./dataValidator.js";

function getRemainingAmountLimit(expenseLimits, currentExpenseLimit) {

    let remainingAmountLimit = 0;

    if (currentExpenseLimit.type === config.expenseLimit.TOTAL_EXPENSE_LIMIT)
        return config.INFINITY_AMOUNT;


    for (const expenseLimit of expenseLimits) {
        if (!expenseLimit.isEnabled) {
            if (expenseLimit.type === config.expenseLimit.TOTAL_EXPENSE_LIMIT)
                return config.INFINITY_AMOUNT;
            continue;
        }

        if (!isAmountValid(expenseLimit.amountLimit))
            return config.INFINITY_AMOUNT;

        if (expenseLimit.type === config.expenseLimit.TOTAL_EXPENSE_LIMIT) {
            remainingAmountLimit = expenseLimit.amountLimit;
        }
        else if (expenseLimit.type !== currentExpenseLimit.type) {
            remainingAmountLimit -= expenseLimit.amountLimit;
        }
    };

    return remainingAmountLimit < 0 ? config.INFINITY_AMOUNT : remainingAmountLimit;

}

export default getRemainingAmountLimit;