
import config from "../configuration/config.js";
import { addCredentialDB, changePasswordCredentialDB, getCredentialDB } from "../repository/query/credentialQuery.js";
import verifyPassword from "../utility/authentication/passwordVerifier.js";
import credentialDBToDTOmapper from "../utility/mapper/credentialDBToDTOMapper.js";
import generateUniqueId from "../utility/builder/uniqueIdGenerator.js";
import { createImageURL } from "../utility/builder/imageHelper.js";
import sendVerificationCode from "../utility/authentication/mailVerifier.js";
import hashPassword from "../utility/authentication/hashPasswordGenerator.js";
import { populateAchievement, populateEmergencyFund, populateExpenseLimits, populateMonthlyExpenseAggregate } from "./UtilController.js";
import { logger } from "../utility/loggerService.js";
import MissingEntryDBException from "../exception/MissingEntryDBException.js";

const loggingLevel = config.loggingLevel;

export async function getCredential(condition) {
    logger(loggingLevel.INFO, `Fetching credentials with condition: {0}`, condition);

    let credentialsDB = await getCredentialDB(condition);
    const credentials = credentialsDB.map(credentialDB => credentialDBToDTOmapper(credentialDB));

    logger(loggingLevel.DEBUG, `Fetched credentials: {0}`, JSON.stringify(credentials, null, 2));

    return credentials;
}

export async function addCredential(username, password, email) {
    const { hashingRounds, hashedPasswordWithSalt } = hashPassword(password);

    logger(loggingLevel.INFO, `Adding new credential for user: {0}, email: {1}`, username, email);

    let credentialDB = await addCredentialDB(
        {
            id: generateUniqueId(),
            hashingRounds: hashingRounds,
            passwordWithSalt: hashedPasswordWithSalt,
            username: username,
            email: email,
            profilePicturePath: config.DEFAULT_PROFILE_PICTURE_PATH
        });
    const credential = credentialDBToDTOmapper(credentialDB);

    logger(loggingLevel.INFO, "Account successfully created for user = {0} with user ID = {1}", credential.username, credential.id);

    populateMonthlyExpenseAggregate(credential.id);
    populateExpenseLimits(credential.id);
    populateEmergencyFund(credential.id);
    populateAchievement(credential.id);
}

export async function isUserPresent(username, password, email = null, isRequestFromScheduler = false) {
    let result = { isUsernamePresent: false, isPasswordPresent: false, isEmailPresentForSameUser: false, isEmailPresentForDifferentUser: false };
    let tokenPayload = null;

    logger(loggingLevel.INFO, `Checking if user exists with username = {0}, email = {1}`, username, email);

    let queryCondition = `WHERE ${config.db.tables.credential.attributes.USERNAME} = '${username}'`;
    if (email) {
        queryCondition += ` OR ${config.db.tables.credential.attributes.EMAIL} = '${email}'`;
    }
    const credentials = await getCredential(queryCondition);

    if (!credentials || credentials.length === 0) {
        logger(loggingLevel.INFO, `User not found with username = {0}, email = {1}`, username, email);
        logger(loggingLevel.DEBUG, "Returning result: {0}, tokenPayload: {1}", JSON.stringify(result, null, 2), tokenPayload);
        return { result, tokenPayload };
    }

    if (isRequestFromScheduler === "true") {
        logger(loggingLevel.INFO, "Request is from scheduler, returning first credential without password verification.");

        tokenPayload = {
            id: credentials[0].id,
            username: credentials[0].username,
            profilePictureURL: createImageURL(credentials[0].profilePicturePath)
        };

        logger(loggingLevel.DEBUG, "Returning result: {0}, tokenPayload: {1}", JSON.stringify(result, null, 2), tokenPayload);
        return { result, tokenPayload };
    }

    for (const credential of credentials) {
        if (credential.username === username) {
            logger(loggingLevel.INFO, `User found with username = {0}`, username);
            result.isUsernamePresent = true;
            if (email && credential.email === email) {
                logger(loggingLevel.INFO, `Email = {0} found for user with username = {0}`, email, username);
                result.isEmailPresentForSameUser = true;
            }

            if (verifyPassword(password, credential.passwordWithSalt, credential.hashingRounds)) {
                logger(loggingLevel.INFO, `Password verified for user with username = {0}`, username);
                result.isPasswordPresent = true;

                tokenPayload = {
                    id: credential.id,
                    username: credential.username,
                    profilePictureURL: createImageURL(credential.profilePicturePath)
                };
            }
        }
        else if (email && credential.email === email) {
            logger(loggingLevel.INFO, `Email = {0} found for different user with username = {0}`, email, credential.username);
            result.isEmailPresentForDifferentUser = true;
        }
    }

    logger(loggingLevel.DEBUG, "Returning result: {0}, tokenPayload: {1}", JSON.stringify(result, null, 2), tokenPayload);
    return { result, tokenPayload };
}

export async function verifyMail(email) {
    logger(loggingLevel.INFO, `Checking if user exist with email: {0}`, email);

    const credentials = await getCredential(`WHERE ${config.db.tables.credential.attributes.EMAIL} = '${email}'`);

    if (!credentials || credentials.length === 0) {
        logger(loggingLevel.INFO, `User not found with email: {0}`, email);
        return "-1";
    }

    logger(loggingLevel.INFO, `User found with email: {0}. Sending verification code to reset password`, email);
    return sendVerificationCode(credentials[0].username, email, "change password");
}

export async function changePassword(password, email) {
    logger(loggingLevel.INFO, `Changing password for user with email: {0}`, email);
    const { hashingRounds, hashedPasswordWithSalt } = hashPassword(password);

    const credentials = await changePasswordCredentialDB(hashedPasswordWithSalt, hashingRounds, email);

    if (!credentials || credentials == undefined || credentials == null || credentials.length === 0) {
        throw new MissingEntryDBException(config.db.tables.credential.TABLE_NAME, email);
    }

    logger(loggingLevel.INFO, `Password changed successfully for user with email: {0}`, credentialDBToDTOmapper(credentials[0]).email);

}