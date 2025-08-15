import config from "../../configuration/config.js";


function barChartBuilder(startOfMonth, expenseAmount, transactionAmounts, expenseLimits) {
    let dataSet = [];

    expenseLimits.forEach(expenseLimit => {
        let data = {
            amount: expenseLimit.type === config.expenseLimit.TOTAL_EXPENSE_LIMIT ? Math.abs(expenseAmount) : Math.abs(transactionAmounts[expenseLimit.type].amount),
            expenseLimit: 0,
            type: expenseLimit.type,
            frequency: 5
        };

        if (new Date(startOfMonth) >= new Date(expenseLimit.date) && expenseLimit.isEnabled)
            data.expenseLimit = Math.abs(expenseLimit.amountLimit);

        if (data.amount !== 0)
            dataSet.push(data);
    });

    return dataSet;
}

export default barChartBuilder;