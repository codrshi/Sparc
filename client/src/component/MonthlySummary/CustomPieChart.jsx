import { PieChart } from "@mui/x-charts";
import config from "../../configuration/config.js";
import pieChartBuilder from "../../utility/builder/pieChartBuilder.js";
import { useState } from "react";
import "./style/MonthlySummary.css";

function CustomPieChart(props) {

    const pieChartStates = [
        {
            list: props.monthlySummary.transactionType,
            title: " based on transaction types"
        },
        {
            list: props.monthlySummary.paymentMethod,
            title: " based on payment methods"
        }
    ]
    const [pieChartStateCursor, setPieChartStateCursor] = useState(0);

    return (
        <div id="pie-chart-body" className="board-body-component">
            <div style={{ alignSelf: 'flex-start' }}>
                <span className="board-body-component-title">Your spending pattern</span>
                <span style={{ fontSize: '0.9rem', color: "var(--bg-color-3)", transition: "all 0.3s ease" }}>{pieChartStates[pieChartStateCursor].title}</span>
            </div>
            <div style={{ width: '100%', height: '15rem' }}>
                <PieChart
                    series={[
                        {
                            data: pieChartBuilder(pieChartStates[pieChartStateCursor].list, props.monthlySummary[config.expenseLimit.TOTAL_EXPENSE_LIMIT].expenseAmount),
                            highlightScope: { fade: 'global', highlight: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                            valueFormatter: valueFormatter(pieChartStates[pieChartStateCursor].list),
                        },
                    ]}
                    colors={config.userInterface.color.pieChartColorPalette}
                    onItemClick={(event, params) => {
                        setPieChartStateCursor((i) => (i + 1) % 2);
                    }}
                />
            </div>
            <span>click on the chart to toggle it</span>
        </div>);
}

function valueFormatter(list) {
    return (item) => `${item.value.toFixed(2)}% (${list[item.label].count} transactions)`;
}
export default CustomPieChart;