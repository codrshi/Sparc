import { PieChart } from '@mui/x-charts/PieChart';
import doughnutChartBuilder from "../../utility/builder/doughnutChartBuilder.js";
import config from '../../configuration/config.js';
import "./style/MonthlySummary.css";

function CustomDoughnutChart(props) {

    let budgetList = ['Income', 'Expense', props.totalBudget.savingsAmount >= 0 ? 'Savings' : 'Deficit'];
    const colorPallette = props.totalBudget.savingsAmount >= 0 ? config.userInterface.color.doughnutChartColorPalette.savings : config.userInterface.color.doughnutChartColorPalette.deficit;

    return (
        <div id="doughnut-chart-body" className="board-body-component">
            <span className="board-body-component-title">Your budget overview</span>
            <div className="doughnut-chart-body-content">
                {budgetList.map((budget, index) => (
                    <div className="doughnut-chart-container" key={budget}>
                        <PieChart
                            series={[
                                {
                                    data: doughnutChartBuilder(props.totalBudget.incomeAmount, props.totalBudget.expenseAmount, props.totalBudget.savingsAmount),
                                    valueFormatter,
                                    innerRadius: 85,
                                    outerRadius: 100,
                                    cornerRadius: 10,
                                    arcLabel: (item) => {
                                        if (item.name === budget)
                                            return (
                                                <>
                                                    <tspan x="0" dy="-1.2em" style={{ font: "Nunito", fill: "var(--bg-color-3)", transistion: "all 0.3s ease" }}>{item.name}</tspan> {/* First Line */}
                                                    <tspan x="0" dy="1.2em" style={{ font: "Nunito", fontSize: "1.3rem", fontWeight: "bold", fill: "var(--bg-color-black-white)", transistion: "all 0.3s ease" }}>{'Rs.' + item.value.toFixed(2)}</tspan> {/* Second Line */}
                                                </>
                                            );
                                    },
                                    arcLabelRadius: 0,
                                    cx: `${60}%`,
                                },
                            ]}
                            colors={colorPallette[index]} />
                    </div>
                ))}
            </div>
        </div>
    );
}

const valueFormatter = (item) => `Rs.${item.value.toFixed(2)}`;

export default CustomDoughnutChart;