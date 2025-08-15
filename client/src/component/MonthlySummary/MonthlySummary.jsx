import React, { useEffect, useState } from "react";
import "./style/MonthlySummary.css";
import config from "../../configuration/config.js";
import MonthSelector from "./MonthSelector";
import emptyStateImage from "../../asset/no_transaction_empty_state.png";
import axios from "axios";
import CustomPieChart from "./CustomPieChart.jsx";
import CustomDoughnutChart from "./CustomDoughnutChart.jsx";
import CustomBarChart from "./CustomBarChart.jsx";
import { Button } from "@mui/material";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CustomLineChart from "./CustomLineChart.jsx";

function MonthlySummary(props) {

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const currentDate = new Date();
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    });
    const [monthlySummary, setMonthlySummary] = useState(null);


    useEffect(() => {
        if (config.db.isQueryExecuting.expenseLimit)
            return;
        config.db.isQueryExecuting.expenseLimit = true;

        axios.get(`${config.endpoints.MONTHLY_SUMMARY}`, {
            params: {
                month: selectedMonth.toLocaleDateString('en-CA')
            }
        })
            .then((response) => {
                setMonthlySummary(() => response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error)
                    props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                else
                    props.setAlertLabel(() => ({ text: "Failed to fetch monthly summary.", severity: config.alertSeverity.ERROR }));
            })
            .finally(() => { config.db.isQueryExecuting.expenseLimit = false; });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth]);

    function handleSelectedMonth(action) {
        switch (action) {
            case config.monthSelectorAction.DECREMENT: setSelectedMonth((prev) => {
                return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
            });
                break;
            case config.monthSelectorAction.INCREMENT: setSelectedMonth((prev) => {
                return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
            });
                break;
            default:
        }
    }

    return (
        <>
            <div className="board-header">
                <span>Your monthly summary</span>
                <MonthSelector
                    selectedMonth={selectedMonth}
                    handleSelectedMonth={handleSelectedMonth}>
                </MonthSelector>
            </div>
            <div className="board-body">
                {monthlySummary === null && <EmptyTransactionState />}
                {monthlySummary !== null && <CustomDoughnutChart totalBudget={monthlySummary[config.expenseLimit.TOTAL_EXPENSE_LIMIT]}></CustomDoughnutChart>}
                {monthlySummary !== null && <CustomPieChart monthlySummary={monthlySummary}></CustomPieChart>}
                {monthlySummary !== null && <CustomBarChart monthlySummary={monthlySummary}></CustomBarChart>}
                {monthlySummary !== null && <CustomLineChart dailyExpense={monthlySummary.dailyExpense}></CustomLineChart>}
            </div>
            {monthlySummary !== null && <div className="board-footer">
                <Button
                    variant="outlined"
                    className="export-button"
                    onClick={() => exportToPDF(monthlySummary.period.endOfMonth, props)}>Export</Button>
            </div>}
        </>
    );
}

function exportToPDF(endOfMonth, props) {
    const element = document.getElementsByClassName('board')[0];
    html2canvas(element, {
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight + 250,
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Monthly_Report_${config.monthNames[parseInt(endOfMonth.substring(5, 7)) - 1]}-${endOfMonth.substring(0, 4)}.pdf`);

        axios.post(`${config.endpoints.ACHIEVEMENT}`, {
            title: config.achievements.id.EXPENSE_TRACKER,
            args: [new Date(), new Date(endOfMonth)]
        })
            .then((response) => console.log(response))
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error)
                    props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                else
                    props.setAlertLabel(() => ({ text: "Failed to update achievement.", severity: config.alertSeverity.ERROR }));
            })
    });
};

function EmptyTransactionState() {
    return (
        <div className='empty-state-body'>
            <img src={emptyStateImage} alt=''></img>
            <span>No transactions found for selected period</span>
        </div>);
}

export default MonthlySummary;