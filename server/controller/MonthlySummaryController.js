import config from "../configuration/config.js";
import { getAllTransactionDB } from "../repository/query/transactionQuery.js";
import monthlySummarySkeletonBuilder from "../utility/builder/monthlySummarySkeletonBuilder.js";
import { logger } from "../utility/loggerService.js";
import transactionDBToDTOmapper from "../utility/mapper/transactionDBToDTOmapper.js";
import { getExpenseLimits } from "./ManageExpensesController.js";

const loggingLevel = config.loggingLevel;

export async function getMonthlySummaryInMonth(month, userId) {

    logger(loggingLevel.INFO, `Fetching monthly summary for month = {0}, user ID = {1}`, config.monthNames[parseInt(month.substring(5, 7)) - 1] + "," + month.substring(0, 4), userId);

    month = new Date(month);

    let startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    let endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return await getMonthlySummaryForInterval(startOfMonth, endOfMonth, userId);
}

export async function getMonthlySummaryForInterval(startOfMonth, endOfMonth, userId) {

    logger(loggingLevel.INFO, `Fetching monthly summary for interval: {0} to {1}`, startOfMonth.toLocaleDateString('en-CA'), endOfMonth.toLocaleDateString('en-CA'), userId);

    const condition = `${config.db.tables.transaction.attributes.TRANSACTION_DATE} BETWEEN '${startOfMonth.toLocaleDateString('en-CA')}' AND '${endOfMonth.toLocaleDateString('en-CA')}'`;
    const transactionsDB = await getAllTransactionDB(condition, config.db.tables.transaction, userId);

    logger(loggingLevel.INFO, `Fetched {0} transactions in given date range.`, transactionsDB.length);
    if (transactionsDB.length === 0)
        return null;

    logger(loggingLevel.DEBUG, `Transactions: {0}`, JSON.stringify(transactionsDB, null, 2));

    let summary = monthlySummarySkeletonBuilder(endOfMonth.getDate());

    transactionsDB.forEach(transactionDB => {
        const transaction = transactionDBToDTOmapper(transactionDB)
        transaction.amount = parseFloat(transaction.amount);
        const day = new Date(transaction.date).getDate();

        if (transaction.amount < 0) {
            summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].expenseAmount += transaction.amount;
            summary.transactionType[transaction.type].amount += transaction.amount;
            summary.paymentMethod[transaction.paymentMethod].amount += transaction.amount;
            summary.dailyExpense[day].amount += transaction.amount;
            summary.transactionType[transaction.type].count++;
            summary.paymentMethod[transaction.paymentMethod].count++;
            summary.dailyExpense[day].count++;
        }
        else {
            summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].incomeAmount += transaction.amount;
        }

        summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].count++;

        if (summary.dailyExpense[day].amount < summary.primeExpense.amount) {
            summary.primeExpense.amount = summary.dailyExpense[day].amount;
            summary.primeExpense.day = day;
        }

        if (transaction.amount < summary.primeTransaction.amount) {
            summary.primeTransaction.amount = transaction.amount;
            summary.primeTransaction.day = day;
        }
    });

    summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].savingsAmount = summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].incomeAmount + summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].expenseAmount;
    summary.expenseLimit = await getExpenseLimits(config.db.NO_CONDITION, userId);
    summary.period.startOfMonth = startOfMonth.toLocaleDateString('en-CA');
    summary.period.endOfMonth = endOfMonth.toLocaleDateString('en-CA');

    logger(loggingLevel.INFO, `Monthly summary fetched successfully.`);
    logger(loggingLevel.DEBUG, `Monthly summary: {0}`, JSON.stringify(summary, null, 2));

    return summary;
}