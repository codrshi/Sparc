import config from "../configuration/config.js";
import { deleteCredentialDB, updateCredentialDB } from "../repository/query/credentialQuery.js";
import settingsSkeletonBuilder from "../utility/builder/settingsSkeletonBuilder.js";
import { getCredential } from "./LoginController.js";
import path from "path";
import fs from "fs";
import { changeImageName, createImageURL } from "../utility/builder/imageHelper.js";
import verifyPassword from "../utility/authentication/passwordVerifier.js";
import credentialDBToDTOmapper from "../utility/mapper/credentialDBToDTOMapper.js";
import { logger } from "../utility/loggerService.js";
import MissingEntryDBException from "../exception/MissingEntryDBException.js";

const PRIORITY_1 = 1;
const PRIORITY_2 = 2;
const PRIORITY_3 = 3;
const PRIORITY_4 = 4;

const loggingLevel = config.loggingLevel;

export async function getAllSettings(userId) {
    let settings = settingsSkeletonBuilder();

    logger(loggingLevel.INFO, `Fetching settings Content for user ID = {0}`, userId);
    const credentials = await getCredential(`WHERE ${config.db.tables.credential.attributes.ID} = '${userId}'`);

    if (!credentials || credentials == undefined || credentials == null || credentials.length === 0) {
        throw new MissingEntryDBException(config.db.tables.credential.TABLE_NAME, userId);
    }

    settings = {
        username: credentials[0].username,
        email: credentials[0].email,
        isTipEnabled: credentials[0].isTipEnabled,
        isExportReportEnabled: credentials[0].isExportReportEnabled,
    };

    logger(loggingLevel.DEBUG, `Settings: {0}`, JSON.stringify(settings, null, 2));

    return settings;
}

export async function updateSettings(settings, password, tempFileName, userId) {

    logger(loggingLevel.INFO, `Updating settings for user ID = {0}`, userId);
    logger(loggingLevel.DEBUG, `Settings: {0}`, JSON.stringify(settings, null, 2));

    logger(loggingLevel.DEBUG, "initial value of tempFileName: {0}", tempFileName);

    let res = null;
    let priority = PRIORITY_4;
    let userCredential = null;
    const credentials = await getCredential(`WHERE ${config.db.tables.credential.attributes.USERNAME} = '${settings.username}' OR ${config.db.tables.credential.attributes.EMAIL} = '${settings.email}' OR ${config.db.tables.credential.attributes.ID} = '${userId}'`);

    for (const credential of credentials) {
        if (credential.id === userId) {
            logger(loggingLevel.INFO, "Matching user ID found.");

            if (!verifyPassword(password, credential.passwordWithSalt, credential.hashingRounds)) {
                logger(loggingLevel.DEBUG, "Password verification failed. Changing priority to {0}.", PRIORITY_1);
                priority = PRIORITY_1;
                res = { alertMessage: "Incorrect password", severity: config.alertSeverity.ERROR };

                if (tempFileName !== null) {
                    const tempFilePath = path.join(config.tempUploadPath, tempFileName);
                    logger(loggingLevel.DEBUG, "Deleting temp file: {0}", tempFilePath);

                    if (fs.existsSync(tempFilePath)) {
                        logger(loggingLevel.DEBUG, "Temp file exists. Deleting it...");
                        fs.unlinkSync(tempFilePath);
                    }
                }
            }
            else {
                logger(loggingLevel.DEBUG, "Password verification successful.");
                userCredential = credential;
            }
        }
        else if (credential.username === settings.username && priority > PRIORITY_2) {
            logger(loggingLevel.DEBUG, "Username already exists. Changing priority to {0}.", PRIORITY_2);
            priority = PRIORITY_2;
            res = { alertMessage: "Username already exists", severity: config.alertSeverity.WARNING };
        }
        else if (credential.email === settings.email && priority > PRIORITY_3) {
            logger(loggingLevel.DEBUG, "Email already registered. Changing priority to {0}.", PRIORITY_3);
            priority = PRIORITY_3;
            res = { alertMessage: "Email already registered", severity: config.alertSeverity.WARNING };
        }
    }

    if (res !== null) {
        logger(loggingLevel.INFO, "Returning early due to operation not being successful");
        logger(loggingLevel.DEBUG, "Returning result: {0}", JSON.stringify(res, null, 2));
        return res;
    }

    settings.profilePicturePath = userCredential.profilePicturePath;

    logger(loggingLevel.DEBUG, "Profile picture path fetched from record = {0}", settings.profilePicturePath);

    if (tempFileName !== null) {
        if (fs.existsSync(userCredential.profilePicturePath)) {
            logger(loggingLevel.DEBUG, "Deleting old profile picture: {0}", userCredential.profilePicturePath);
            fs.unlinkSync(userCredential.profilePicturePath);
        }

        const tempFilePath = path.join(config.tempUploadPath, tempFileName);
        const newFilePath = path.join(config.uploadPath, changeImageName(tempFileName, settings.username));

        try {
            fs.renameSync(tempFilePath, newFilePath);
            logger(loggingLevel.INFO, "Profile picture updated successfully!");
            logger(loggingLevel.DEBUG, "Renamed tempFilePath = {0} to newFilePath = {1}", tempFilePath, newFilePath);
        }
        catch (err) {
            console.error("Error renaming file", err);
        }

        if (fs.existsSync(tempFilePath)) {
            logger(loggingLevel.DEBUG, "Temp file = {0} exists. Deleting it...", tempFilePath);
            fs.unlinkSync(tempFilePath);
        }

        settings.profilePicturePath = newFilePath;
        logger(loggingLevel.INFO, "Updated profile picture path = {0}", settings.profilePicturePath);
    }

    if (userCredential.username !== settings.username) {
        logger(loggingLevel.DEBUG, "Renaming old profile picture to new name: {0}", settings.username);
        const oldFileName = path.join(config.uploadPath, settings.profilePicturePath.split("/").pop().split("\\").pop());
        const newFilePath = path.join(config.uploadPath, changeImageName(oldFileName, settings.username));

        try {
            fs.renameSync(oldFileName, newFilePath);
            logger(loggingLevel.INFO, "Profile picture renamed successfully!");
            logger(loggingLevel.DEBUG, "Renamed oldFileName = {0} to newFilePath = {1}", oldFileName, newFilePath);
        }
        catch (err) {
            console.error("Error renaming file", err);
        }

        settings.profilePicturePath = newFilePath;
        logger(loggingLevel.INFO, "Updated profile picture path = {0}", settings.profilePicturePath);
    }

    const userCredentialDB = await updateCredentialDB({
        ...userCredential,
        ...settings
    });

    userCredential = credentialDBToDTOmapper(userCredentialDB);

    logger(loggingLevel.INFO, "Credential updated successfully for user ID = {0}", userId);
    logger(loggingLevel.DEBUG, "Updated username = {0}, profile picture path = {1}", userCredential.username, userCredential.profilePicturePath);

    return {
        alertMessage: "Settings updated successfully",
        severity: config.alertSeverity.SUCCESS,
        tokenPayload: {
            id: userCredential.id,
            username: userCredential.username,
            profilePictureURL: createImageURL(userCredential.profilePicturePath)
        }
    };
}

export async function deleteCredential(userId) {
    logger(loggingLevel.INFO, `Deleting credential for user ID = {0}`, userId);
    const credentialDB = await deleteCredentialDB(userId);

    logger(loggingLevel.INFO, `Credential deleted successfully for user ID = {0}`, userId);
    return credentialDBToDTOmapper(credentialDB);
}