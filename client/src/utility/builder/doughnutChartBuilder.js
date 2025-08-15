function doughnutChartBuilder(incomeAmount, expenseAmount, savingsAmount) {
    let data = [];

    data.push({ name: 'Income', value: incomeAmount });
    data.push({ name: 'Expense', value: Math.abs(expenseAmount) });
    data.push({ name: savingsAmount >= 0 ? 'Savings' : 'Deficit', value: Math.abs(savingsAmount) });

    return data;
}

export default doughnutChartBuilder;