import express from "express";
import config from "../configuration/config.js";
import { getMonthlySummaryInMonth } from "../controller/MonthlySummaryController.js";
import { unlockAchievment } from "../utility/achievementHandler.js";
import { verifyToken } from "./LoginRoute.js";
import { logger } from "../utility/loggerService.js";
import { validateDate, validateId } from "../utility/dataValidator.js";

const router = express.Router();
const loggingLevel = config.loggingLevel;

router.get(config.endpoints.MONTHLY_SUMMARY, verifyToken, async (req, res, next) => {
    const { month } = req.query;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}, month = {2}`, config.endpoints.MONTHLY_SUMMARY, userId, month);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.MONTHLY_SUMMARY);
        validateDate(month, config.parameters.MONTH, config.endpoints.MONTHLY_SUMMARY);

        const monthlySummary = await getMonthlySummaryInMonth(month, userId);
        res.status(200).json(monthlySummary);
    } catch (error) {
        next(error);
    }
});

router.post(config.endpoints.ACHIEVEMENT, verifyToken, async (req, res, next) => {
    const title = req.body.title;
    const args = req.body.args;
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with parameters: user ID = {1}, title = {2}, args = {3}`, config.endpoints.ACHIEVEMENT, userId, title, JSON.stringify(args, null, 2));

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.ACHIEVEMENT);

        await unlockAchievment(userId, title, ...args);
        res.status(200).end();
    } catch (error) {
        next(error);
    }
});

export default router;