import express from "express";
import config from "../configuration/config.js";
import { deleteCredential, getAllSettings, updateSettings } from "../controller/SettingsController.js";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { verifyToken } from "./LoginRoute.js";
import { getAccessToken } from "../utility/authentication/jwtTokenGenerator.js";
import { logger } from "../utility/loggerService.js";
import { validateBoolean, validateId } from "../utility/dataValidator.js";

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || config.node_env.DEVELOPMENT;

const router = express.Router();
const loggingLevel = config.loggingLevel;

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, config.tempUploadPath);
        },
        filename: (req, file, cb) => {
            if (!file.originalname) {
                return cb(null, "");
            }

            const filename = req.user.username + path.extname(file.originalname);
            const filePath = path.join(config.tempUploadPath, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            cb(null, filename);
        }
    })
});

router.get(config.endpoints.settings.CREDENTIAL, verifyToken, async (req, res, next) => {
    const userId = req.user?.id;

    logger(config.loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: user ID = {1}`, config.endpoints.settings.CREDENTIAL, userId);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.settings.CREDENTIAL);

        const settings = await getAllSettings(userId);
        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
});

router.put(config.endpoints.settings.CREDENTIAL, verifyToken, upload.single("profilePicture"), async (req, res, next) => {
    const userId = req.user?.id;
    const username = req.user.username;

    const credential = {
        username: req.body.username,
        email: req.body.email,
        isTipEnabled: req.body.isTipEnabled,
        isExportReportEnabled: req.body.isExportReportEnabled,
        profilePicturePath: null
    };

    const tempFileName = req.file ? username + path.extname(req.file.originalname) : null;
    const password = req.body.password;

    logger(loggingLevel.DEBUG, `Server route PUT {0} intercepted with parameters: user ID = {1}, credential = {2}, password = {3}`, config.endpoints.settings.CREDENTIAL, userId, JSON.stringify(credential, null, 2), password);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.settings.CREDENTIAL);
        validateBoolean(credential.isTipEnabled, config.parameters.CREDENTIAL_IS_TIP_ENABLED, config.endpoints.settings.CREDENTIAL);
        validateBoolean(credential.isExportReportEnabled, config.parameters.CREDENTIAL_IS_EXPORT_REPORT_ENABLED, config.endpoints.settings.CREDENTIAL);

        const result = await updateSettings(credential, password, tempFileName, userId);

        if (result.tokenPayload) {
            const accessToken = getAccessToken(result.tokenPayload);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: NODE_ENV === config.node_env.PRODUCTION, // Works only on HTTPS (use false for localhost)
                sameSite: "Strict",
                maxAge: 60 * 60 * 1000
            });

            logger(loggingLevel.DEBUG, `Access token generated: {0}, validity is 1 hour.`, accessToken);

            res.cookie("id", result.tokenPayload.id, { maxAge: 60 * 60 * 1000 });
            res.cookie("username", result.tokenPayload.username, { maxAge: 60 * 60 * 1000 });
            res.cookie("profilePictureURL", result.tokenPayload.profilePictureURL, { maxAge: 60 * 60 * 1000 });

            logger(loggingLevel.DEBUG, `Cookies set: id = {0}, username = {1}, profilePictureURL = {2}, Validity is 1 hour.`, result.tokenPayload.id, result.tokenPayload.username, result.tokenPayload.profilePictureURL);

            res.status(200).json({ alertMessage: result.alertMessage, severity: result.severity, accessToken: accessToken });
        }
        else
            res.status(200).json({ alertMessage: result.alertMessage, severity: result.severity });

    } catch (error) {
        next(error);
    }
});

router.post(config.endpoints.settings.LOGOUT, (req, res, next) => {

    logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with parameters: user ID = {1}`, config.endpoints.settings.LOGOUT, req.user?.id);

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("username", { path: "/" });
    res.clearCookie("profilePictureURL", { path: "/" });

    logger(loggingLevel.DEBUG, `Cookies cleared: accessToken, refreshToken, username, profilePictureURL`);

    res.status(200).json({ alertMessage: "Logged out successfully", severity: config.alertSeverity.SUCCESS });
});

router.delete(config.endpoints.settings.DELETE_ACCOUNT, verifyToken, async (req, res, next) => {

    const userId = req.user?.id;

    logger(loggingLevel.DEBUG, `Server route DELETE {0} intercepted with parameters: user ID = {1}`, config.endpoints.settings.DELETE_ACCOUNT, userId);

    try {
        validateId(userId, config.parameters.USER_ID, config.endpoints.settings.DELETE_ACCOUNT);

        const result = await deleteCredential(userId);
        console.log("Account deleted successfully for user: ", result.username);
    } catch (error) {
        next(error);
    }

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("username", { path: "/" });
    res.clearCookie("profilePictureURL", { path: "/" });

    res.status(200).json({ alertMessage: "Account deleted  successfully", severity: config.alertSeverity.SUCCESS });
});

export default router;