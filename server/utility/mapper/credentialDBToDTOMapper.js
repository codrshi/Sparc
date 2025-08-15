import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function credentialDBToDTOmapper(credentialDB) {

    if (credentialDB == null)
        return null;

    logger(config.loggingLevel.DEBUG, "Mapping credentialDB to DTO...");

    const credential = {
        id: credentialDB[config.db.tables.credential.attributes.ID],
        username: credentialDB[config.db.tables.credential.attributes.USERNAME],
        passwordWithSalt: credentialDB[config.db.tables.credential.attributes.PASSWORD_WITH_SALT],
        hashingRounds: credentialDB[config.db.tables.credential.attributes.HASHING_ROUNDS],
        email: credentialDB[config.db.tables.credential.attributes.EMAIL],
        createdAt: credentialDB[config.db.tables.credential.attributes.CREATED_AT],
        isTipEnabled: credentialDB[config.db.tables.credential.attributes.IS_TIP_ENABLED],
        isExportReportEnabled: credentialDB[config.db.tables.credential.attributes.IS_EXPORT_REPORT_ENABLED],
        profilePicturePath: credentialDB[config.db.tables.credential.attributes.PROFILE_PICTURE_PATH],
        creditsLeft: credentialDB[config.db.tables.credential.attributes.CREDITS_LEFT]
    };

    logger(config.loggingLevel.DEBUG, "Mapped credentialDB to DTO successfully.");
    return credential;
}

export default credentialDBToDTOmapper