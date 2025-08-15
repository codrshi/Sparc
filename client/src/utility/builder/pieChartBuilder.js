function pieChartBuilder(list, totalAmount) {
    let data = [];

    for (let entry in list) {

        data.push({ label: entry, value: ((list[entry].amount * 100) / totalAmount) });
    }

    return data;
}

export default pieChartBuilder;