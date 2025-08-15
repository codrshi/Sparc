function monthYearFormatter(date) {
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${month}, ${year}`;
}

export default monthYearFormatter;