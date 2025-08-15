import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function monthlyAmountWithLimitDBToDTOmapper(monthlyAmountWithLimitDB) {

    if (monthlyAmountWithLimitDB == null)
        return null;

    logger(config.loggingLevel.DEBUG, "Mapping monthlyAmountWithLimitDB to DTO...");

    const monthlyAmountWithLimit = {
        type: monthlyAmountWithLimitDB[config.db.tables.expenseLimit.attributes.TRANSACTION_TYPE],
        amountLimit: monthlyAmountWithLimitDB[config.db.tables.expenseLimit.attributes.TRANSACTION_AMOUNT_LIMIT],
        amount: monthlyAmountWithLimitDB[config.db.tables.monthlyExpenseAggregate.attributes.MONTHLY_AMOUNT],
        creationMonth: monthlyAmountWithLimitDB[config.db.tables.expenseLimit.attributes.CREATION_MONTH],
        month: monthlyAmountWithLimitDB[config.db.tables.monthlyExpenseAggregate.attributes.MONTH],
    };

    logger(config.loggingLevel.DEBUG, "Mapped monthlyAmountWithLimitDB to DTO successfully.");
    return monthlyAmountWithLimit;
}

export default monthlyAmountWithLimitDBToDTOmapper;