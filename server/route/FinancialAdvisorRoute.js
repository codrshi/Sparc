import express from "express";
import config from "../configuration/config.js";
import { verifyToken } from "./LoginRoute.js";
import { getAdvice, getCredits } from "../controller/FinancialAdvisorController.js";
import { logger } from "../utility/loggerService.js";
import { validateDate, validateDateRange, validateId } from "../utility/dataValidator.js";

const router = express.Router();
const loggingLevel = config.loggingLevel;

router.get(config.endpoints.financialAdvisor.CREDITS, verifyToken, async (req, res, next) => {
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}`, config.endpoints.financialAdvisor.CREDITS, userId);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.financialAdvisor.CREDITS);

        const result = await getCredits(userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});


router.get(config.endpoints.financialAdvisor.ADVICE, verifyToken, async (req, res, next) => {
    const userId = req.user?.id;
    const { startDate, endDate } = req.query;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}, startDate = {2}, endDate = {3}`, config.endpoints.financialAdvisor.ADVICE, userId, startDate, endDate);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.financialAdvisor.ADVICE);
        validateDate(startDate, config.parameters.START_DATE, config.endpoints.financialAdvisor.ADVICE);
        validateDate(endDate, config.parameters.END_DATE, config.endpoints.financialAdvisor.ADVICE);
        validateDateRange(startDate, endDate, config.endpoints.financialAdvisor.ADVICE);

        const result = await getAdvice(startDate, endDate, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;