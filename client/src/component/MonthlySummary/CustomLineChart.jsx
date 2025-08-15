import { axisClasses, LineChart } from "@mui/x-charts";
import lineChartBuilder from "../../utility/builder/lineChartBuilder.js";

function CustomLineChart(props) {
    return (
        <div id="line-chart-body" className="board-body-component">
            <span className="board-body-component-title">Your daily spending trends</span>
            <div className="line-chart-body-content" style={{ width: '80%', height: `20rem` }}>
                <LineChart
                    dataset={lineChartBuilder(props.dailyExpense)}
                    xAxis={[{ dataKey: 'day', min: 1, max: 31, label: 'day of the month', tickLabelStyle: { fill: "var(--bg-color-black-white)" }, }]}
                    yAxis={[{ label: 'amount (Rs.)', tickLabelStyle: { fill: "var(--bg-color-black-white)" }, }]}
                    series={[
                        {
                            curve: 'linear', dataKey: 'amount', label: 'Expense incurred', color: '#6237a0', valueFormatter: (value) => `Rs.${value}`
                        },
                    ]}
                    margin={{ left: 100 }}
                    sx={{
                        [`.${axisClasses.left} .${axisClasses.label}`]: {
                            transform: 'translate(-3rem, 0)',
                            fill: "var(--bg-color-black-white)"
                        },
                        [`.${axisClasses.bottom} .${axisClasses.label}`]: {
                            fill: "var(--bg-color-black-white)"
                        },
                        "& .MuiChartsLegend-label": {
                            fill: "var(--bg-color-black-white)", // Legend text color
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default CustomLineChart;