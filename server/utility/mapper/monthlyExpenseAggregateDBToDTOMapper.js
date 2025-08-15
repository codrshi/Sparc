import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function monthlyExpenseAggregateDBToDTOmapper(monthlyExpenseAggregateDB) {

    if (monthlyExpenseAggregateDB == null)
        return null;

    logger(config.loggingLevel.DEBUG, "Mapping monthlyExpenseAggregateDB to DTO...");
    const monthlyExpenseAggregateDTO = {
        month: monthlyExpenseAggregateDB[config.db.tables.monthlyExpenseAggregate.attributes.MONTH],
        amount: monthlyExpenseAggregateDB[config.db.tables.monthlyExpenseAggregate.attributes.MONTHLY_AMOUNT],
        type: monthlyExpenseAggregateDB[config.db.tables.monthlyExpenseAggregate.attributes.TRANSACTION_TYPE],
        credentialId: monthlyExpenseAggregateDB[config.db.tables.monthlyExpenseAggregate.foreignKey.CREDENTIAL_ID]
    };

    logger(config.loggingLevel.DEBUG, "Mapped monthlyExpenseAggregateDB to DTO successfully.");
    return monthlyExpenseAggregateDTO;
}

export default monthlyExpenseAggregateDBToDTOmapper;