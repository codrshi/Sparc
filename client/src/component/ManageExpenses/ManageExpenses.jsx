import React from "react";
import "./style/ManageExpenses.css";
import { styled, Switch } from "@mui/material";
import ExpenseLimitAccordion from "./ExpenseLimitAccordion";
import RecurringTransactionAccordion from "./RecurringTransactionAccordion";
import EmergencyFundAccordion from "./EmergencyFundAccordion";
import { inputFieldStyle } from "../Login/Login";

function ManageExpenses(props) {

  return (
    <>
      <div className="board-header">
        <span>Manage Expenses</span>
      </div>
      <div className="board-body">
        <ExpenseLimitAccordion
          inputFieldStyle={inputFieldStyle}
          AntSwitch={AntSwitch}
          setAlertLabel={props.setAlertLabel}>
        </ExpenseLimitAccordion>
        <RecurringTransactionAccordion
          boardHeight={props.boardHeight}
          setAlertLabel={props.setAlertLabel}>
        </RecurringTransactionAccordion>
        <EmergencyFundAccordion
          inputFieldStyle={inputFieldStyle}
          AntSwitch={AntSwitch}
          setAlertLabel={props.setAlertLabel}>
        </EmergencyFundAccordion>
      </div>
    </>);
}



export const AntSwitch = styled(Switch)(({ theme }) => ({
  width: "4rem",
  height: "2rem",
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: "2rem",
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(0.5rem)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: "0.25rem",
    '&.Mui-checked': {
      transform: 'translateX(2rem)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#6237a0',
        ...theme.applyStyles('dark', {
          backgroundColor: '#177ddc',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "2rem",
    color: 'white',
    transition: theme.transitions.create(['width'], {
      duration: 100,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: "2rem",
    opacity: 1,
    backgroundColor: 'var(--bg-color-3)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

export default ManageExpenses;