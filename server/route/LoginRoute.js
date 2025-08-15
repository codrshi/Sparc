import express from "express";
import config from "../configuration/config.js";
import { addCredential, changePassword, getCredential, isUserPresent, verifyMail } from "../controller/LoginController.js";
import sendVerificationCode from "../utility/authentication/mailVerifier.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { getAccessToken, getRefreshToken } from "../utility/authentication/jwtTokenGenerator.js";
import { createImageURL } from "../utility/builder/imageHelper.js";
import { logger } from "../utility/loggerService.js";
import { validateToken } from "../utility/dataValidator.js";
import ExpiredTokenException from "../exception/ExpiredTokenException.js";

dotenv.config();
const loggingLevel = config.loggingLevel;

const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "your_refresh_secret";
const NODE_ENV = process.env.NODE_ENV || config.node_env.DEVELOPMENT;

const router = express.Router();

router.get(`${config.endpoints.login.IS_USER_PRESENT}`, async (req, res, next) => {
    const { username, password, email, isLoginPage, isRememberMeChecked, isRequestFromScheduler } = req.query;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: username = {1}, password = {2}, email = {3}, isLoginPage = {4}, isRememberMeChecked = {5}, isRequestFromScheduler = {6}`, config.endpoints.login.IS_USER_PRESENT, username, password, email, isLoginPage, isRememberMeChecked, isRequestFromScheduler);

    try {
        const { result, tokenPayload } = await isUserPresent(username, password, email, isRequestFromScheduler);

        if (isLoginPage && tokenPayload !== null) {
            const accessToken = getAccessToken(tokenPayload);
            const refreshToken = getRefreshToken(tokenPayload.id);

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: NODE_ENV === config.node_env.PRODUCTION, // Works only on HTTPS (use false for localhost)
                sameSite: "Strict",
                maxAge: 60 * 60 * 1000 // 1 hr in ms
            });

            logger(loggingLevel.DEBUG, `Access token generated: {0}, validity is 1 hour.`, accessToken);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: NODE_ENV === config.node_env.PRODUCTION,
                sameSite: "Strict",
                maxAge: isRememberMeChecked === "true" ? 7 * 24 * 60 * 60 * 1000 : null, // 7 day
            });

            logger(loggingLevel.DEBUG, `Refresh token generated: {0}, validity is 7 days.`, refreshToken);

            res.cookie("id", tokenPayload.id, { maxAge: 60 * 60 * 1000 });
            res.cookie("username", tokenPayload.username, { maxAge: 60 * 60 * 1000 });
            res.cookie("profilePictureURL", tokenPayload.profilePictureURL, { maxAge: 60 * 60 * 1000 });

            logger(loggingLevel.DEBUG, `Cookies set: id = {0}, username = {1}, profilePictureURL = {2}, Validity is 1 hour.`, tokenPayload.id, tokenPayload.username, tokenPayload.profilePictureURL);
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.post(`${config.endpoints.login.LOGIN}`, async (req, res, next) => {
    const { username, password, email } = req.body;

    logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with parameters: username = {1}, password = {2}, email = {3}`, config.endpoints.login.LOGIN, username, password, email);

    try {
        await addCredential(username, password, email);
        res.status(200).json({ message: "Credential added successfully" });
    } catch (error) {
        next(error);
    }
});

router.get(`${config.endpoints.login.VERIFICATION_CODE}`, async (req, res, next) => {
    const { username, email } = req.query;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: username = {1}, email = {2}`, config.endpoints.login.VERIFICATION_CODE, username, email);

    try {
        const result = await sendVerificationCode(username, email, "register");
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get(`${config.endpoints.login.VERIFY_EMAIL}`, async (req, res, next) => {
    const { email } = req.query;

    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted with parameters: email = {1}`, config.endpoints.login.VERIFY_EMAIL, email);

    try {
        const result = await verifyMail(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.put(`${config.endpoints.login.CHANGE_PASSWORD}`, async (req, res, next) => {

    const { password, email } = req.body;

    logger(loggingLevel.DEBUG, `Server route PUT {0} intercepted with parameters: password = {1}, email = {2}`, config.endpoints.login.CHANGE_PASSWORD, password, email);

    try {
        await changePassword(password, email);
        res.status(200).json({ message: "Changed Password successfully" });
    } catch (error) {
        next(error);
    }
});

router.post(config.endpoints.login.REFRESH_TOKEN, (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    logger(loggingLevel.DEBUG, `Server route POST {0} intercepted with cookies: refreshToken = {1}`, config.endpoints.login.REFRESH_TOKEN, refreshToken);

    try {
        validateToken(refreshToken, config.parameters.REFRESH_TOKEN, config.endpoints.login.REFRESH_TOKEN);

        jwt.verify(refreshToken, REFRESH_SECRET_KEY, async (err, user) => {
            if (err) {
                throw new ExpiredTokenException(config.parameters.REFRESH_TOKEN)
            }

            logger(loggingLevel.DEBUG, `Generating fresh access token for user ID = {0}`, user.id);

            const credentials = await getCredential(` WHERE ${config.db.tables.credential.attributes.ID}='${user.id}'`)

            const newAccessToken = getAccessToken({
                id: credentials[0].id,
                username: credentials[0].username,
                email: credentials[0].email,
                profilePictureURL: createImageURL(credentials[0].profilePicturePath)
            });

            logger(loggingLevel.DEBUG, `Access token generated: {0}, validity is 1 hour.`, newAccessToken);

            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: NODE_ENV === config.node_env.PRODUCTION,
                sameSite: "Strict",
                maxAge: 60 * 60 * 1000
            });

            res.cookie("id", credentials[0].id, { maxAge: 60 * 60 * 1000 });
            res.cookie("username", credentials[0].username, { maxAge: 60 * 60 * 1000 });
            res.cookie("profilePictureURL", createImageURL(credentials[0].profilePicturePath), { maxAge: 60 * 60 * 1000 });

            logger(loggingLevel.DEBUG, `Cookies set: id = {0}, username = {1}, profilePictureURL = {2}, Validity is 1 hour.`, tokenPayload.id, tokenPayload.username, tokenPayload.profilePictureURL);

            res.status(200).json({ accessToken: newAccessToken });
        });
    } catch (error) {
        next(error);
    }
});

export const verifyToken = (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    logger(loggingLevel.DEBUG, `Server middleware verifyToken intercepted with cookies: accessToken = {0}`, accessToken);

    try {
        validateToken(accessToken, config.parameters.ACCESS_TOKEN, config.endpoints.login.AUTH);

        try {
            req.user = jwt.verify(accessToken, SECRET_KEY);
        }
        catch (error) {
            throw new ExpiredTokenException(config.parameters.ACCESS_TOKEN);
        }
        logger(loggingLevel.DEBUG, `Token verified successfully for user ID = {0}`, req.user.id);
        next();
    } catch (error) {
        next(error);
    }
};

router.get(config.endpoints.login.AUTH, verifyToken, (req, res) => {
    logger(loggingLevel.DEBUG, `Server route GET {0} intercepted.`, config.endpoints.login.AUTH);
    res.status(200).json({ isAuthenticated: true });
});

export default router;