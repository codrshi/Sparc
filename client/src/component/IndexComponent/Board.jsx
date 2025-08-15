import React, { useEffect, useRef, useState } from "react";
import Dashboard from "../dashboardSectionComponent/Dashboard.jsx";
import MyTransactions from "../myTransactionSectionComponent/MyTransactions.jsx";
import "./style/Board.css";
import MonthlySummary from "../MonthlySummary/MonthlySummary.jsx";
import config from "../../configuration/config.js";
import ManageExpenses from "../ManageExpenses/ManageExpenses.jsx";
import Settings from "../Settings/Settings.jsx";
import CustomAlert from "./CustomAlert.jsx";
import FinancialAdvisor from "../FinancialAdvisor/FinancialAdvisor.jsx";

function Board(props) {

    const [alertLabel, setAlertLabel] = useState({ text: "Login successful..", severity: config.alertSeverity.SUCCESS });
    const [boardHeight, setBoardHeight] = useState(0);
    let boardRef = useRef(null);

    useEffect(() => {
        if (boardRef.current !== null)
            setBoardHeight(boardRef.current.clientHeight);
    }, [boardHeight]);

    return (<div className="board" ref={boardRef}>
        {props.clickedSection === config.panelNames.DASHBOARD ? <Dashboard setAlertLabel={setAlertLabel}></Dashboard> : null}
        {props.clickedSection === config.panelNames.MY_TRANSACTIONS ? <MyTransactions setAlertLabel={setAlertLabel} boardHeight={boardHeight} currentPanel={config.userInterface.transactionTableUiFields.myTransactionsPanel}></MyTransactions> : null}
        {props.clickedSection === config.panelNames.MONTHLY_SUMMARY ? <MonthlySummary setAlertLabel={setAlertLabel}></MonthlySummary> : null}
        {props.clickedSection === config.panelNames.MANAGE_EXPENSES ? <ManageExpenses setAlertLabel={setAlertLabel} boardHeight={boardHeight}></ManageExpenses> : null}
        {props.clickedSection === config.panelNames.SETTINGS ? <Settings setAlertLabel={setAlertLabel}></Settings> : null}
        {props.clickedSection === config.panelNames.FINANCIAL_ADVISOR ? <FinancialAdvisor setAlertLabel={setAlertLabel}></FinancialAdvisor> : null}
        <CustomAlert
            setAlertLabel={setAlertLabel}
            alertLabel={alertLabel}
        ></CustomAlert>
    </div>);
}

export default Board;