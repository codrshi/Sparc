import express from "express";
import { getDashboard } from "../controller/DashboardController.js";
import config from "../configuration/config.js";
import { verifyToken } from "./LoginRoute.js";
import { logger } from "../utility/loggerService.js";
import { validateId } from "../utility/dataValidator.js";

const router = express.Router();
const loggingLevel = config.loggingLevel;

router.get(config.endpoints.DASHBOARD, verifyToken, async (req, res, next) => {
    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}`, config.endpoints.DASHBOARD, userId);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.DASHBOARD);

        const dashboard = await getDashboard(userId);
        res.status(200).json(dashboard);
    } catch (error) {
        next(error);
    }
});

export default router;