import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function transactionDBToDTOmapper(transactionDB) {

    if (transactionDB == null)
        return null;

    logger(config.loggingLevel.DEBUG, "Mapping transactionDB to DTO...");
    const transactionDTO = {
        id: transactionDB[config.db.tables.transaction.attributes.TRANSACTION_ID],
        amount: transactionDB[config.db.tables.transaction.attributes.TRANSACTION_AMOUNT],
        type: transactionDB[config.db.tables.transaction.attributes.TRANSACTION_TYPE],
        paymentMethod: transactionDB[config.db.tables.transaction.attributes.PAYMENT_METHOD],
        date: transactionDB[config.db.tables.transaction.attributes.TRANSACTION_DATE],
        description: transactionDB[config.db.tables.transaction.attributes.TRANSACTION_DESCRIPTION],
        credentialId: transactionDB[config.db.tables.transaction.foreignKey.CREDENTIAL_ID]
    };

    logger(config.loggingLevel.DEBUG, "Mapped transactionDB to DTO successfully.");
    return transactionDTO;
}

export default transactionDBToDTOmapper;