import { axisClasses, BarChart } from "@mui/x-charts";
import config from "../../configuration/config.js";
import "./style/MonthlySummary.css";
import barChartBuilder from "../../utility/builder/BarChartBuilder.js";

function CustomBarChart(props) {

  const dataSet = barChartBuilder(props.monthlySummary.period.startOfMonth, props.monthlySummary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].expenseAmount, props.monthlySummary.transactionType, props.monthlySummary.expenseLimit);

  return (
    <div id="expense-progress-body" className="board-body-component">
      <span className="board-body-component-title">Your expense progress</span>
      <div className="expense-progress-body-content" style={{ width: '80%', height: `${6 * Math.log2(dataSet.length + 1)}rem` }}>
        <BarChart
          dataset={dataSet}
          yAxis={[{ scaleType: 'band', dataKey: 'type', label: 'transaction type', tickLabelStyle: { fill: "var(--bg-color-black-white)" }, }]}
          series={[{ dataKey: 'amount', label: 'Expense incurred', color: '#6237a0', valueFormatter, },
          { dataKey: 'expenseLimit', label: 'Expense limit', color: '#d592f4', valueFormatter }]}
          layout="horizontal"
          xAxis={[
            {
              label: 'amount (Rs.)',
              tickLabelStyle: { fill: "var(--bg-color-black-white)" },
            },
          ]}
          margin={{ left: 100 }}
          sx={{
            [`.${axisClasses.left} .${axisClasses.label}`]: {
              transform: 'translate(-4rem, 0)',
              fill: "var(--bg-color-black-white)"
            },
            [`.${axisClasses.bottom} .${axisClasses.label}`]: {
              fill: "var(--bg-color-black-white)"
            },
            "& .MuiChartsLegend-label": {
              color: "var(--bg-color-black-white)"
            },
          }}
        />
      </div>
    </div>
  );
}

function valueFormatter(value) {
  return `Rs.${value}`;
}

export default CustomBarChart;