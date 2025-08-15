import transactionDBToDTOmapper from "../utility/mapper/transactionDBToDTOmapper.js";
import config from "../configuration/config.js";
import { addTransactionDB, deleteTransactionDB, getAllTransactionDB, updateTransactionDB } from "../repository/query/transactionQuery.js";
import { unlockAchievment } from "../utility/achievementHandler.js";
import { logger } from "../utility/loggerService.js";

const loggingLevel = config.loggingLevel;

export async function getAllTransaction(condition, offset, limit, isRecurring, userId) {

    if (condition === config.db.NO_CONDITION)
        condition = `ORDER BY ${config.db.tables.transaction.attributes.TRANSACTION_DATE} DESC`;

    if (limit !== config.db.NO_CONDITION)
        condition += ` LIMIT ${limit}`;
    if (offset !== config.db.NO_CONDITION)
        condition += ` OFFSET ${offset}`;

    const table = isRecurring ? config.db.tables.recurringTransaction : config.db.tables.transaction;

    logger(loggingLevel.INFO, `Fetching all transactions with condition: {0}`, condition);
    logger(loggingLevel.DEBUG, `Fetching transactions from table: {0}`, table);

    const transactionsDB = await getAllTransactionDB(condition, table, userId);

    const transactions = transactionsDB.map(transactionDB => {
        return transactionDBToDTOmapper(transactionDB)
    });

    logger(loggingLevel.DEBUG, `Fetched transactions: {0}`, JSON.stringify(transactions, null, 2));
    return transactions;
}

export async function updateTransaction(id, newTransaction, isRecurring, userId) {
    logger(loggingLevel.INFO, `Updating transaction with ID = {0}`, id);
    logger(loggingLevel.DEBUG, `New transaction data: {0}`, JSON.stringify(newTransaction, null, 2));

    const table = isRecurring ? config.db.tables.recurringTransaction : config.db.tables.transaction;

    logger(loggingLevel.DEBUG, `Updating transactions from table: {0}`, table);

    const updatedTransactionDB = await updateTransactionDB(id, newTransaction, table, userId);
    const updatedTransaction = transactionDBToDTOmapper(updatedTransactionDB);

    logger(loggingLevel.INFO, `Transaction with ID = {0} updated successfully`, id);
    logger(loggingLevel.DEBUG, `Updated transaction: {0}`, JSON.stringify(updatedTransaction, null, 2));

    return updatedTransaction;
}

export async function addTransaction(newTransaction, isRecurring, userId) {

    newTransaction.amount = parseFloat(parseFloat(newTransaction.amount).toFixed(2));

    const table = isRecurring ? config.db.tables.recurringTransaction : config.db.tables.transaction;
    const achievementId = isRecurring ? config.achievements.id.RECURRING_ROCKSTAR : config.achievements.id.FIRST_STEP;

    const addedTransactionDB = await addTransactionDB(newTransaction, table, userId);
    unlockAchievment(userId, achievementId);


    return transactionDBToDTOmapper(addedTransactionDB);
}

export async function deleteTransaction(id, isRecurring, userId) {
    const table = isRecurring ? config.db.tables.recurringTransaction : config.db.tables.transaction;

    const deletedTransactionDB = await deleteTransactionDB(id, table, userId);

    return transactionDBToDTOmapper(deletedTransactionDB);
}