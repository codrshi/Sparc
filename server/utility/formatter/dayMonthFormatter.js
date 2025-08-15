import config from "../../configuration/config.js";

function dayMonthFormatter(date) {
    const month = parseInt(date.split("-")[1]);
    const day = date.split("-")[2];
    return `${day}, ${config.monthNames[month - 1]}`;
}

export default dayMonthFormatter;