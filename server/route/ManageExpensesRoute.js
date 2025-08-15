import express from "express";
import { addExpenseLimits, getEmergencyFund, getExpenseLimits, getMonthlyExpenseAggregate, updateEmergencyFund, updateMonthlyExpenseAggregate } from "../controller/ManageExpensesController.js";
import { addTransaction, deleteTransaction, getAllTransaction, updateTransaction } from "../controller/MyTransactionsController.js";
import config from "../configuration/config.js";
import { verifyToken } from "./LoginRoute.js";
import { validateEmergencyFund, validateExpenseLimits, validateId, validateNumber, validateTransaction } from "../utility/dataValidator.js";
import { logger } from "../utility/loggerService.js";

const router = express.Router();
const loggingLevel = config.loggingLevel;

router.put(config.endpoints.manageExpenses.EXPENSE_LIMIT, verifyToken, async (req, res, next) => {
    const expenseLimits = req.body;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route PUT {0} intercepted with parameters: user ID = {1}, expenseLimits = {2}`, config.endpoints.manageExpenses.EXPENSE_LIMIT, userId, JSON.stringify(expenseLimits, null, 2));

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.EXPENSE_LIMIT);
        validateExpenseLimits(expenseLimits, config.endpoints.manageExpenses.EXPENSE_LIMIT);

        await addExpenseLimits(expenseLimits, userId);
        res.status(200).end();
    } catch (error) {
        next(error);
    }
});

router.get(config.endpoints.manageExpenses.EXPENSE_LIMIT, verifyToken, async (req, res, next) => {
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}`, config.endpoints.manageExpenses.EXPENSE_LIMIT, userId);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.EXPENSE_LIMIT);

        const expenseLimits = await getExpenseLimits(config.db.NO_CONDITION, userId);
        res.status(200).json(expenseLimits);
    } catch (error) {
        next(error);
    }

});

// router.post(config.endpoints.manageExpenses.EMERGENCY_FUND, verifyToken, async (req,res,next)=>{
//     const emergencyFund = req.body;
//     const userId = req.user?.id;

//     logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with parameters: user ID = {1}, emergencyFund = {2}`, config.endpoints.manageExpenses.EMERGENCY_FUND, userId, JSON.stringify(emergencyFund, null, 2));

//     try {
//         validateUserId(userId, config.endpoints.manageExpenses.EMERGENCY_FUND);
//         validateEmergencyFund(emergencyFund, config.endpoints.manageExpenses.EMERGENCY_FUND);

//         await addEmergencyFund(emergencyFund, userId); 
//         res.status(200).end();
//     } catch (error) {
//         next(error);
//     }
// });

router.put(config.endpoints.manageExpenses.EMERGENCY_FUND, verifyToken, async (req, res, next) => {
    let emergencyFund = req.body;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route PUT {0} intercepted with parameters: user ID = {1}, emergencyFund = {2}`, config.endpoints.manageExpenses.EMERGENCY_FUND, userId, JSON.stringify(emergencyFund, null, 2));

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.EMERGENCY_FUND);
        validateEmergencyFund(emergencyFund, config.endpoints.manageExpenses.EMERGENCY_FUND);

        emergencyFund = await updateEmergencyFund(emergencyFund, userId);
        res.status(200).json(emergencyFund);
    } catch (error) {
        next(error);
    }
});

router.get(config.endpoints.manageExpenses.EMERGENCY_FUND, verifyToken, async (req, res, next) => {
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}`, config.endpoints.manageExpenses.EMERGENCY_FUND, userId);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.EMERGENCY_FUND);

        const emergencyFunds = await getEmergencyFund(config.db.NO_CONDITION, userId);
        res.status(200).json(emergencyFunds[0]);
    } catch (error) {
        next(error);
    }
});

router.post(config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE, verifyToken, async (req, res, next) => {
    const { oldTransaction, newTransaction } = req.body;
    let dialogMessage = null;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with parameters: user ID = {1}, oldTransaction = {2}, newTransaction = {3}`, config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE, userId, JSON.stringify(oldTransaction, null, 2), JSON.stringify(newTransaction, null, 2));

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE);
        if (oldTransaction) {
            validateTransaction(oldTransaction, config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE);
        }
        if (newTransaction) {
            validateTransaction(newTransaction, config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE);
        }

        dialogMessage = await updateMonthlyExpenseAggregate(oldTransaction, newTransaction, userId);
        res.status(200).json(dialogMessage);
    }
    catch (error) {
        next(error);
    }
});

// router.get(config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE, verifyToken,async (req,res)=>{
//     const {condition} = req.query;
//     const userId = req.user.id;

//     try{
//         const monthlyExpenseAggregates=await getMonthlyExpenseAggregate(condition, userId);
//         res.status(200).json( monthlyExpenseAggregates); 
//     }
//     catch (error) {
//         console.error("Error fetching monthly expense aggregate: ", error); 
//         res.status(500).json({ message: "Failed to fetch monthly expense aggregate." }); 
//     }
// });

router.get(config.endpoints.manageExpenses.RECURRING_TRANSACTION, verifyToken, async (req, res, next) => {
    const { condition, offset, limit } = req.query;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}, condition = {2}, offset = {3}, limit = {4}`, config.endpoints.manageExpenses.RECURRING_TRANSACTION, userId, condition, offset, limit);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.RECURRING_TRANSACTION);
        validateNumber(offset, config.parameters.OFFSET, config.endpoints.manageExpenses.RECURRING_TRANSACTION);
        validateNumber(limit, config.parameters.LIMIT, config.endpoints.manageExpenses.RECURRING_TRANSACTION);

        const recurringTransactions = await getAllTransaction(condition, offset, limit, true, userId);
        res.status(200).json(recurringTransactions);
    } catch (error) {
        next(error);
    }
});

router.put(config.endpoints.manageExpenses.RECURRING_TRANSACTION, verifyToken, async (req, res, next) => {
    const { transactionId } = req.query;
    let recurringTransaction = req.body;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route PUT {0} intercepted with parameters: user ID = {1}, transaction ID = {2}, recurringTransaction = {3}`, config.endpoints.manageExpenses.RECURRING_TRANSACTION, userId, transactionId, JSON.stringify(recurringTransaction, null, 2));

    try {
        validateId(transactionId, config.parameters.TRANSACTION_ID, config.endpoints.manageExpenses.RECURRING_TRANSACTION);
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.RECURRING_TRANSACTION);
        validateTransaction(recurringTransaction, config.endpoints.manageExpenses.RECURRING_TRANSACTION);

        recurringTransaction = await updateTransaction(transactionId, recurringTransaction, true, userId);
        res.status(200).json(recurringTransaction);
    } catch (error) {
        next(error);
    }
});

router.post(config.endpoints.manageExpenses.RECURRING_TRANSACTION, verifyToken, async (req, res, next) => {
    const recurringTransaction = req.body;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with parameters: user ID = {1}, recurringTransaction = {2}`, config.endpoints.manageExpenses.RECURRING_TRANSACTION, userId, JSON.stringify(recurringTransaction, null, 2));

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.RECURRING_TRANSACTION);
        validateTransaction(recurringTransaction, config.endpoints.manageExpenses.RECURRING_TRANSACTION);

        const addedRecurringTransaction = await addTransaction(recurringTransaction, true, userId);
        res.status(200).json(addedRecurringTransaction);
    } catch (error) {
        next(error);
    }
});

router.delete(config.endpoints.manageExpenses.RECURRING_TRANSACTION, verifyToken, async (req, res, next) => {
    const { transactionId } = req.query;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route DELETE {0} intercepted with parameters: transactionId = {1}, userId = {2}`, config.endpoints.manageExpenses.RECURRING_TRANSACTION, transactionId, userId);

    try {
        validateId(transactionId, config.parameters.TRANSACTION_ID, config.endpoints.manageExpenses.RECURRING_TRANSACTION);
        validateId(userId, config.parameters.USER_ID, config.endpoints.manageExpenses.RECURRING_TRANSACTION);

        const recurringTransaction = await deleteTransaction(transactionId, true, userId);
        res.status(200).json(recurringTransaction);
    } catch (error) {
        next(error);
    }
});

export default router;