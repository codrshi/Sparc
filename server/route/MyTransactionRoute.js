import express from "express";
import { addTransaction, deleteTransaction, getAllTransaction, updateTransaction } from "../controller/MyTransactionsController.js";
import config from "../configuration/config.js";
import { verifyToken } from "./LoginRoute.js";
import { validateNumber, validateTransaction, validateId } from "../utility/dataValidator.js";
import { logger } from "../utility/loggerService.js";

const router = express.Router();
const loggingLevel = config.loggingLevel;

router.get(config.endpoints.TRANSACTION, verifyToken, async (req, res, next) => {
    const { condition, offset, limit } = req.query;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}, condition = {2}, offset = {3}, limit = {4}`, config.endpoints.TRANSACTION, userId, condition, offset, limit);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.TRANSACTION);
        validateNumber(offset, config.parameters.OFFSET, config.endpoints.TRANSACTION);
        validateNumber(limit, config.parameters.LIMIT, config.endpoints.TRANSACTION);

        const transactions = await getAllTransaction(condition, offset, limit, false, userId);
        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
});

router.put(config.endpoints.TRANSACTION, verifyToken, async (req, res, next) => {
    const { transactionId } = req.query;
    let transaction = req.body;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route PUT {0} intercepted with parameters: user ID = {1}, transactionId = {2}, transaction = {3}`, config.endpoints.TRANSACTION, userId, transactionId, JSON.stringify(transaction, null, 2));

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.TRANSACTION);
        validateId(transactionId, config.parameters.TRANSACTION_ID, config.endpoints.TRANSACTION);
        validateTransaction(transaction, config.endpoints.TRANSACTION);

        transaction = await updateTransaction(transactionId, transaction, false, userId);
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
});

router.post(config.endpoints.TRANSACTION, verifyToken, async (req, res, next) => {
    const transaction = req.body;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with parameters: user ID = {1}, transaction = {2}`, config.endpoints.TRANSACTION, userId, JSON.stringify(transaction, null, 2));

    try {
        validateId(userId, config.endpoints.TRANSACTION);
        validateTransaction(transaction, config.endpoints.TRANSACTION);

        const addedTransaction = await addTransaction(transaction, false, userId);
        res.status(200).json(addedTransaction);
    } catch (error) {
        next(error);
    }
});

router.delete(config.endpoints.TRANSACTION, verifyToken, async (req, res, next) => {
    const { transactionId } = req.query;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route DELETE {0} intercepted with parameters: user ID = {1}, transactionId = {2}`, config.endpoints.TRANSACTION, userId, transactionId);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.TRANSACTION);
        validateId(transactionId, config.parameters.TRANSACTION_ID, config.endpoints.TRANSACTION);

        const transaction = await deleteTransaction(transactionId, false, userId);
        res.status(200).json(transaction);
    } catch (error) {
        next(error);
    }
});

export default router;