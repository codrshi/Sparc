import config from "../../configuration/config.js";
import { logger } from "../loggerService.js";

function expenseLimitNotificationBuilder(monthlyAmountWithLimits) {
  const messages = [];

  monthlyAmountWithLimits.map(monthlyAmountWithLimit => {
    const amountLimit = parseFloat(monthlyAmountWithLimit.amountLimit), monthlyAmount = Math.abs(parseFloat(monthlyAmountWithLimit.amount));

    if (monthlyAmount >= amountLimit)
      messages.push({ message: `You have exceeded your ${monthlyAmountWithLimit.type} expense limit by Rs.${monthlyAmount - amountLimit} for the current month.`, type: config.notificationType.warn });
    else if (monthlyAmount >= config.expenseLimit.EXPENSE_LIMIT_WARN_FRACTION * amountLimit)
      messages.push({ message: `You are approaching your ${monthlyAmountWithLimit.type} expense limit with Rs.${amountLimit - monthlyAmount} remaining for the current month.`, type: config.notificationType.warn });

  });

  logger(config.loggingLevel.DEBUG, `Expense limit notification message: {0}`, messages.map(message => message.message).join("\n"));
  return messages;
}

export default expenseLimitNotificationBuilder;