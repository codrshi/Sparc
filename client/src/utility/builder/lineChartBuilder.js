function lineChartBuilder(list) {
  let data = [];

  for (let entry in list) {
    data.push({ day: entry, amount: Math.abs(list[entry].amount) });
  }

  return data;
}

export default lineChartBuilder;