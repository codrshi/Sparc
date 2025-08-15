import React from "react";
import "./style/ManageExpenses.css";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MyTransactions from "../myTransactionSectionComponent/MyTransactions.jsx";
import config from "../../configuration/config.js";

function RecurringTransactionAccordion(props) {

  return (<div id="set-recurring-transaction" className="board-body-component">
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'var(--bg-color-2)', transition: "all 0.3s ease" }} />}
        aria-controls="panel1-content"
        sx={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--bg-color-black-white)", backgroundColor: "var(--bg-color-white-black)", transition: "all 0.3s ease" }}>
        Your recurring transactions
      </AccordionSummary>
      <AccordionDetails>
        <div className="board-body-component-accordion-content">
          <span>Your recurring transactions will be automatically added at the specified day of every month.</span>
          <MyTransactions setAlertLabel={props.setAlertLabel} boardHeight={props.boardHeight} currentPanel={config.userInterface.transactionTableUiFields.manageExpensesPanel}></MyTransactions>
        </div>
      </AccordionDetails>
    </Accordion>
  </div>);
}

export default RecurringTransactionAccordion;