import { parentPort, workerData } from "worker_threads";
import { getEnabledExpenseLimitsWithMonthlyAmount } from "../../../controller/UtilController.js";
import nodemailer from "nodemailer";
import setDayToOne from "../../dateDayToOneSetter.js";
import { unlockAchievment } from "../../achievementHandler.js";
import config from "../../../configuration/config.js";
import puppeteer from 'puppeteer';
import { logger } from "../../loggerService.js";

const loggingLevel = config.loggingLevel;
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SPARC_MAIL_ID,
        pass: process.env.SPARC_MAIL_PASSWORD,
    },
});

async function executeWorker() {

    const { credential } = workerData;
    const userId = credential.id;

    logger(loggingLevel.INFO, `export-expense-report-job worker started for userId = ${userId}`);

    const browser = await puppeteer.launch({ headless: true });
    try {
        const { startOfMonth, month, year } = getDate();
        const monthlySummaryPanelButton = '.monthly-summary';
        const previousMonthButton = '#previous-month-button';
        const donutChartBody = "#doughnut-chart-body";
        const homeURL = `http://${process.env.CLIENT_HOST}:${process.env.CLIENT_PORT}/home`;

        const page = await browser.newPage();
        const loginURL = `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}${config.endpoints.login.IS_USER_PRESENT}?username=${credential.username}&password=${null}&email=${credential.email}&isLoginPage=true&isRememberMeChecked=false&isRequestFromScheduler=true`;

        await page.goto(loginURL, { waitUntil: 'networkidle2' });

        const cookies = await page.browserContext().cookies();
        logger(loggingLevel.DEBUG, `Cookies set by server = {0}`, JSON.stringify(cookies, null, 2));

        // page.on('response', async (response) => {
        //     if (response.url().includes(config.endpoints.login.IS_USER_PRESENT)) {
        //       console.log("Request URL:", response.url());
        //       console.log("Status:", response.status());

        //       const body = await response.json();
        //       console.log("Response JSON:", body);
        //     }
        //   });

        await page.goto(homeURL, { waitUntil: 'networkidle2' });
        await page.waitForSelector(monthlySummaryPanelButton);
        await page.click(monthlySummaryPanelButton);

        await page.waitForSelector(previousMonthButton, { timeout: 5000 });
        await page.click(previousMonthButton);

        try {
            await page.waitForSelector(donutChartBody, { timeout: 5000 });
        } catch (err) {
            logger(loggingLevel.DEBUG, `Report for ${month}, ${year} is not available. Skipping mail generation.`);
            parentPort.postMessage({ success: true });
            return;
        }

        logger(loggingLevel.DEBUG, `Monthly report for ${month}, ${year} is available. Generating mail...`);

        await page.waitForSelector(donutChartBody, { timeout: 5000 });

        await page.setViewport({
            width: 1080,
            height: 1800
        });

        const pdfBuffer = await page.pdf({
            printBackground: true,
            width: '1080px',
            height: `1800px`
        });

        if (pdfBuffer === null)
            return null;

        const htmlContent = await getExpenseLimitMailBody(startOfMonth, month, year, userId, credential.username);

        await transporter.sendMail({
            from: `${process.env.SPARC_MAIL_ID}`,
            to: `${credential.email}`,
            subject: `Monthly Expense Report For ${month}, ${year}`,
            text: `Your expense report is ready for the month of ${month}, ${year}.`,
            html: htmlContent,
            attachments: [
                {
                    filename: `Monthly_Report_${month}-${year}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });

        logger(loggingLevel.INFO, `Mail sent to ${credential.email} with monthly report for ${month}, ${year}`);
    }
    catch (error) {
        logger(loggingLevel.ERROR, `export-expense-report-job worker for user ID = {0} failed with error: {1}`, userId, error);
        parentPort.postMessage({ success: false, error: error.message });
    }
    finally {
        await browser.close();
    }

    logger(loggingLevel.INFO, `export-expense-report-job worker for user ID = {0} finished.`, userId);
    parentPort.postMessage({ success: true });
}

function getDate() {
    let date = new Date();
    date.setMonth(date.getMonth() - 1);
    const startOfMonth = setDayToOne(date);
    date = date.toLocaleDateString('en-CA');
    const month = config.monthNames[parseInt(date.substring(5, 7)) - 1];
    const year = date.substring(0, 4);
    return { startOfMonth, month, year };
}

async function getExpenseLimitMailBody(startOfMonth, month, year, userId, username) {

    const monthlyAmountWithLimits = await getEnabledExpenseLimitsWithMonthlyAmount(`${config.db.tables.monthlyExpenseAggregate.TABLE_NAME}.${config.db.tables.monthlyExpenseAggregate.attributes.MONTH}='${startOfMonth}'`, userId);

    let statusMap = new Map();
    let isExpenseLimitExceeded = false;

    monthlyAmountWithLimits.forEach(monthlyAmountWithLimit => {
        const amountLimit = Math.abs(parseFloat(monthlyAmountWithLimit.amountLimit));
        const amount = monthlyAmountWithLimit.amount;

        if (amount < amountLimit)
            statusMap.set(monthlyAmountWithLimit.type, config.expenseLimit.EXPENSE_LIMIT_IN_CHECK);
        else {
            statusMap.set(monthlyAmountWithLimit.type, config.expenseLimit.EXPENSE_LIMIT_EXCEEDING);
            isExpenseLimitExceeded = true;
        }
    });

    unlockAchievment(userId, config.achievements.id.BUDGET_GURU, isExpenseLimitExceeded);

    let tableContent = '';
    statusMap.forEach((status, type) => {
        tableContent += `<tr><td>${type}</td><td>${status}</td></tr>`;
    });

    const htmlContent = `<p>Hi ${username}, please find your detailed expense report attached as a PDF.</p>`;
    if (tableContent === '')
        return htmlContent;


    return `
    <h2>Your Monthly Expense Summary (${month}/${year})</h2>
    <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr>
            <th style="background-color: #f2f2f2;">Expense type</th>
            <th style="background-color: #f2f2f2;">Status</th>
        </tr>
        ${tableContent}
    </table>
    ${htmlContent}`;
}

executeWorker();