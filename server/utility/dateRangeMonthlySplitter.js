import { logger } from "./loggerService.js";

function splitIntoMonthlyIntervals(startDate, endDate) {
    const intervals = [];
    let current = new Date(startDate);

    while (current <= endDate) {
        const startOfThisMonth = new Date(current);
        const startOfNextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        const endOfThisMonth = new Date(Math.min(new Date(startOfNextMonth - 1), endDate));

        intervals.push({
            start: startOfThisMonth,
            end: endOfThisMonth,
        });

        current = startOfNextMonth;
    }

    logger("INFO", `Split date range from {0} to {1} into {2} monthly intervals`, startDate.toLocaleDateString('en-CA'), endDate.toLocaleDateString('en-CA'), intervals.length);
    intervals.forEach(interval => {
        logger("DEBUG", `Interval: {0} to {1}`, interval.start.toLocaleDateString('en-CA'), interval.end.toLocaleDateString('en-CA'));
    });

    return intervals;
}

export default splitIntoMonthlyIntervals;