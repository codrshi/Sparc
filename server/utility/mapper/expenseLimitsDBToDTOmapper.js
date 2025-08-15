import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function expenseLimitsDBToDTOmapper(expenseLimitsDB) {

    if (expenseLimitsDB == null)
        return null;

    logger(config.loggingLevel.DEBUG, "Mapping expenseLimitsDB to DTO...");
    const expenseLimits = {
        type: expenseLimitsDB[config.db.tables.expenseLimit.attributes.TRANSACTION_TYPE],
        amountLimit: expenseLimitsDB[config.db.tables.expenseLimit.attributes.TRANSACTION_AMOUNT_LIMIT],
        isEnabled: expenseLimitsDB[config.db.tables.expenseLimit.attributes.IS_ENABLED],
        date: expenseLimitsDB[config.db.tables.expenseLimit.attributes.CREATION_MONTH],
        credentialId: expenseLimitsDB[config.db.tables.expenseLimit.foreignKey.CREDENTIAL_ID]
    };

    logger(config.loggingLevel.DEBUG, "Mapped expenseLimitsDB to DTO successfully.");
    return expenseLimits;
}

export default expenseLimitsDBToDTOmapper;