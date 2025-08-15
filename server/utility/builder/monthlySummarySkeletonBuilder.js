import config from "../../configuration/config.js";

function monthlySummarySkeletonBuilder(endDay) {
    const summary = {
        [config.expenseLimit.TOTAL_EXPENSE_LIMIT]: { expenseAmount: 0, incomeAmount: 0, savingsAmount: 0, count: 0 },
        transactionType: {},
        paymentMethod: {},
        dailyExpense: {},
        primeExpense: { amount: 0, day: 0 },
        primeTransaction: { amount: 0, day: 0 },
        expenseLimit: [],
        period: {
            startOfMonth: "",
            endOfMonth: ""
        }
    };

    for (const type in config.transactionTypes) {
        summary.transactionType[config.transactionTypes[type]] = { amount: 0, count: 0 };
    }

    for (const method in config.paymentMethods) {
        summary.paymentMethod[config.paymentMethods[method]] = { amount: 0, count: 0 };
    }

    for (let i = 1; i <= endDay; i++) {
        summary.dailyExpense[i] = { amount: 0, count: 0 };
    }
    return summary;
}

export default monthlySummarySkeletonBuilder;