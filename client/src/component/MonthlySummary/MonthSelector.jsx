import React from "react";
import "./style/MonthlySummary.css";
import config from "../../configuration/config";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Tooltip } from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import monthYearFormatter from "../../utility/formatter/monthYearFormatter.js";

function MonthSelector(props) {

    function isCurrentDate(date) {
        const currentDate = new Date();
        return (
            date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear()
        );
    };

    return (<div className="month-selector-body">
        <div id="previous-month-button"
            className="arrow-button"
            onClick={() => props.handleSelectedMonth(config.monthSelectorAction.DECREMENT)}>
            <Tooltip title="Select previous month">
                <ArrowBackIosIcon></ArrowBackIosIcon>
            </Tooltip>
        </div>
        <span>{monthYearFormatter(props.selectedMonth)}</span>
        <div id="next-month-button"
            className={["arrow-button", isCurrentDate(props.selectedMonth) ? "disabled-button" : ""].join(' ')}
            onClick={() => {
                if (!isCurrentDate(props.selectedMonth))
                    return props.handleSelectedMonth(config.monthSelectorAction.INCREMENT)
            }}>
            <Tooltip title="Select next month">
                <ArrowForwardIosIcon></ArrowForwardIosIcon>
            </Tooltip>
        </div>
    </div>)
}

export default MonthSelector;