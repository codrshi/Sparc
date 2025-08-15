import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function emergencyFundDBToDTOmapper(emergencyFundDB) {

    if (emergencyFundDB == null)
        return null;

    logger(config.loggingLevel.DEBUG, "Mapping emergencyFundDB to DTO...");

    const emergencyFund = {
        amount: emergencyFundDB[config.db.tables.emergencyFund.attributes.AMOUNT],
        defaultTargetAmount: emergencyFundDB[config.db.tables.emergencyFund.attributes.DEFAULT_TARGET_AMOUNT],
        targetAmount: emergencyFundDB[config.db.tables.emergencyFund.attributes.TARGET_AMOUNT],
        isEnabled: emergencyFundDB[config.db.tables.emergencyFund.attributes.IS_ENABLED],
        percentageValue: emergencyFundDB[config.db.tables.emergencyFund.attributes.PERCENTAGE_VALUE],
        pastMonthCount: emergencyFundDB[config.db.tables.emergencyFund.attributes.PAST_MONTH_COUNT],
        credentialId: emergencyFundDB[config.db.tables.emergencyFund.foreignKey.CREDENTIAL_ID]
    };

    logger(config.loggingLevel.DEBUG, "Mapped emergencyFundDB to DTO successfully.");
    return emergencyFund;
}

export default emergencyFundDBToDTOmapper;