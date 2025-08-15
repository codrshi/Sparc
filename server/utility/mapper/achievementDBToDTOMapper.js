import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function achievementDBToDTOmapper(achievementsDB) {

    if (achievementsDB == null)
        return null;

    logger(config.loggingLevel.DEBUG, "Mapping achievementDB to DTO...");

    const achievements = {
        unlockMask: parseInt(achievementsDB[config.db.tables.achievement.attributes.UNLOCK_MASK]),
        credentialId: achievementsDB[config.db.tables.achievement.foreignKey.CREDENTIAL_ID]
    };

    logger(config.loggingLevel.DEBUG, "Mapped achievementDB to DTO successfully.");
    return achievements;
}

export default achievementDBToDTOmapper;