import config from "../../configuration/config.js";

const transactionDB = config.db.tables.transaction;

function getQueryBuilder(queryParameter) {
    let whereClauses = [];
    let orderByClauses = [];

    if (queryParameter[config.transaction.TYPE] !== null) {
        whereClauses.push(`${transactionDB.attributes.TRANSACTION_TYPE} = '${queryParameter[config.transaction.TYPE]}'`);
    }

    if (queryParameter[config.transaction.PAYMENT] !== null) {
        whereClauses.push(`${transactionDB.attributes.PAYMENT_METHOD} = '${queryParameter[config.transaction.PAYMENT]}'`);
    }

    if (queryParameter[config.transaction.DATE] !== null) {
        orderByClauses.push(`${transactionDB.attributes.TRANSACTION_DATE} ${queryParameter[config.transaction.DATE]}`);
    }

    if (queryParameter[config.transaction.AMOUNT] !== null) {
        orderByClauses.push(`${transactionDB.attributes.TRANSACTION_AMOUNT} ${queryParameter[config.transaction.AMOUNT]}`);
    }

    const whereQuery = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const orderByQuery = orderByClauses.length > 0 ? `ORDER BY ${orderByClauses.join(", ")}` : "";

    return `${whereQuery} ${orderByQuery}`.trim();
}

export default getQueryBuilder;