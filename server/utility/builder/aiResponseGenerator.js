import config from '../../configuration/config.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { logger } from '../loggerService.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function getAiResponse(monthlySummaries, startDate, endDate) {

    const prompt = `
    You are a financial advisor. Based on the following user's monthly financial data for the period from ${startDate.toLocaleDateString('en-CA')} to ${endDate.toLocaleDateString('en-CA')}, give personalized advice for budgeting, saving, and improving financial health.

    ${Array.from(monthlySummaries.entries()).map(([month, summary]) =>
        `Data for period ${month}: 
        1. General Overview:
            - Total Income: ${summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].incomeAmount.toFixed(2)}
            - Total Expense: ${summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].expenseAmount.toFixed(2)}
            - Total Savings: ${summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].savingsAmount.toFixed(2)}
            - Total transactions: ${summary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].count}
        
        2. Expenses by type:
        ${Object.entries(summary.transactionType).filter(([type, data]) => data.count > 0).map(([type, data]) =>
            `   - ${data.count} transactions of type ${type} with amount ${data.amount.toFixed(2)}`
        ).join('\n')}

        3. Expenses by payment method:
        ${Object.entries(summary.paymentMethod).filter(([method, data]) => data.count > 0).map(([method, data]) =>
            `   - ${data.count} transactions with payment method ${method} with amount ${data.amount.toFixed(2)}`
        ).join('\n')}

        4. Daily expenses:
        ${Object.entries(summary.dailyExpense).filter(([day, data]) => data.count > 0).map(([day, data]) =>
            `   - ${data.count} transactions on day ${day} with amount ${data.amount.toFixed(2)}`
        ).join('\n')}

        5. Monthly expense limit:
        ${Object.entries(summary.expenseLimit).filter(([type, data]) => data.isEnabled === true && data.amountLimit > 0).map(([type, data]) =>
            `   - Transaction type ${data.type} has amount limit ${data.amountLimit.toFixed(2)}`
        ).join('\n')}
    `).join('\n')}

    Your response should be:
    - In friendly and clear tone
    - With 3-5 bullet points of personalized and actionable advice
    - Avoid generic advice, use actual numbers from data
    - Your response will be directly sent to the user. So avoid any disclaimers, conclusions or unnecessary information
    `;

    logger(config.loggingLevel.DEBUG, `Sending prompt to OpenAI: {0}`, prompt);

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages: [
            { role: "user", content: prompt }
        ],
        temperature: 0.7,
    });

    logger(config.loggingLevel.DEBUG, `Received response from OpenAI: {0}`, response.choices[0].message.content);
    return response.choices[0].message.content;
}

export default getAiResponse;