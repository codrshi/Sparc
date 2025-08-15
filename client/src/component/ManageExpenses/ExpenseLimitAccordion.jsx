import React, { useEffect, useRef } from "react";
import "./style/ManageExpenses.css";
import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, Slide, Stack, TextField, Tooltip } from "@mui/material";
import { isAmountValid } from "../../utility/dataValidator.js";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import getRemainingAmountLimit from "../../utility/remainingAmountLimitCalculator.js";
import config from "../../configuration/config.js";
import { useState } from "react";
import axios from "axios";

function ExpenseLimitAccordion(props) {

  const [expenseLimits, setExpenseLimits] = useState([]);
  const savedState = useRef(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isResetButtonClicked, setIsResetButtonClicked] = useState(false);

  useEffect(() => {
    if (config.db.isQueryExecuting.expenseLimit || savedState.current !== null)
      return;

    config.db.isQueryExecuting.expenseLimit = true;
    axios.get(config.endpoints.manageExpenses.EXPENSE_LIMIT)
      .then((response) => {
        setExpenseLimits(() => response.data);
        savedState.current = response.data;
        console.log(response.data)
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to fetch data.", severity: config.alertSeverity.ERROR }));
      })
      .finally(() => { config.db.isQueryExecuting.expenseLimit = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsButtonEnabled(() => {
      let limitAmount = 0;
      for (const expenseLimit of expenseLimits) {
        if (expenseLimit.isEnabled) {
          if (expenseLimit.amountLimit === "" || !isAmountValid(expenseLimit.amountLimit))
            return false;
          if (expenseLimit.type === config.expenseLimit.TOTAL_EXPENSE_LIMIT)
            limitAmount += parseFloat(expenseLimit.amountLimit);
          else
            limitAmount -= parseFloat(expenseLimit.amountLimit);
        }
      };

      return limitAmount >= 0 && JSON.stringify(savedState.current) !== JSON.stringify(expenseLimits);
    });
  }, [savedState, expenseLimits]);

  function handleChange(index, field, value) {
    setExpenseLimits(prevExpenseLimits => prevExpenseLimits.map((prevLimit, i) => i === index ? { ...prevLimit, [field]: value } : prevLimit));
  }

  function handleSaveClick(expenseLimits) {

    if (config.db.isQueryExecuting.expenseLimit)
      return;

    config.db.isQueryExecuting.expenseLimit = true;
    axios.put(config.endpoints.manageExpenses.EXPENSE_LIMIT, expenseLimits)
      .then((response) => {
        savedState.current = expenseLimits;
        props.setAlertLabel(() => ({ text: "Changes saved.", severity: "success" }));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to save changes.", severity: config.alertSeverity.ERROR }));
      })
      .finally(() => {
        config.db.isQueryExecuting.expenseLimit = false;
        setIsButtonEnabled(() => false);
      });
  }

  function handleResetClick() {
    const defaultExpenseLimits = expenseLimits.map((expenseLimit) =>
    ({
      ...expenseLimit,
      isEnabled: false,
      amountLimit: 0
    })
    );
    setExpenseLimits(() => defaultExpenseLimits)
    handleSaveClick(defaultExpenseLimits);
  }

  return (<div id="set-expense-limit-by-catergory" className="board-body-component">
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'var(--bg-color-2)', transition: "all 0.3s ease" }} />}
        aria-controls="panel1-content"
        sx={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--bg-color-black-white)", backgroundColor: "var(--bg-color-white-black)", transition: "all 0.3s ease" }}>
        Your monthly expense limit
      </AccordionSummary>
      <AccordionDetails>
        <div className="board-body-component-accordion-content">
          <span>You'll receive notifications as you approach the expense limits, ensuring better financial control. The expense limits will be effective from the current month onwards.</span>
          {expenseLimits.map((expenseLimit, index) => (
            <div className="board-body-component-accordion-content-component" key={expenseLimit.type}>
              <span>Set your {config.expenseLimit.expenseLimitsLabel[expenseLimit.type]}</span>
              <Tooltip
                title={
                  getRemainingAmountLimit(expenseLimits, expenseLimit) !== config.INFINITY_AMOUNT
                    ? "should be less than " + getRemainingAmountLimit(expenseLimits, expenseLimit)
                    : ""
                }
                arrow
                placement="top"
              >
                <TextField
                  className="input-text-field"
                  variant="standard"
                  value={expenseLimit.amountLimit}
                  sx={{
                    ...props.inputFieldStyle,
                    "& .MuiFormHelperText-root": {
                      visibility: "hidden", // Hide helper text by default
                    },
                    "& .Mui-focused + .MuiFormHelperText-root": {
                      visibility: "visible", // Show helper text when TextField is focused
                    },
                  }}
                  disabled={!expenseLimit.isEnabled}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start"><span className={expenseLimit.isEnabled ? "rupee-icon" : "rupee-icon-disabled"}>₹</span></InputAdornment>
                      ),
                      sx: {
                        '&:after': {
                          borderBottomColor: isAmountValid(expenseLimit.amountLimit) && (getRemainingAmountLimit(expenseLimits, expenseLimit) === config.INFINITY_AMOUNT || expenseLimit.amountLimit <= getRemainingAmountLimit(expenseLimits, expenseLimit)) ? '#6237a0' : 'red', // Color when focused
                        },
                        '&:before': {
                          borderBottomColor: (expenseLimit.isEnabled && (!isAmountValid(expenseLimit.amountLimit) || (getRemainingAmountLimit(expenseLimits, expenseLimit) !== config.INFINITY_AMOUNT && expenseLimit.amountLimit > getRemainingAmountLimit(expenseLimits, expenseLimit)))) ? 'red' : 'var(--bg-color-2)', // Default color
                        },
                        '&:hover:not(.Mui-disabled):before': {
                          borderBottomColor: '#9754cb', // Hover color
                        },
                      },
                    },
                  }}
                  onChange={(e) => handleChange(index, 'amountLimit', e.target.value)}
                >
                </TextField>
              </Tooltip>
              <Stack
                direction="row"
                spacing={"0.5rem"}>
                <props.AntSwitch
                  checked={expenseLimit.isEnabled}
                  onChange={() => { handleChange(index, 'isEnabled', !expenseLimit.isEnabled) }}
                  inputProps={{ 'aria-label': 'ant design' }} />
              </Stack>
            </div>
          ))}
          <div id="button-section" className="board-body-component">
            <Button
              variant="outlined"
              id={isButtonEnabled
                ? "enabled-save-button"
                : "disabled-save-button"}
              className="manage-expenses-button"
              disabled={!isButtonEnabled}
              onClick={() => handleSaveClick(expenseLimits)}>
              Save
            </Button>
            <Button
              variant="contained"
              id="reset-button"
              className="manage-expenses-button"
              onClick={() => setIsResetButtonClicked(true)}>
              Reset
            </Button>
          </div>
        </div>
      </AccordionDetails>
    </Accordion>
    <React.Fragment>
      <Dialog
        open={isResetButtonClicked === true}
        slotProps={{
          transition: { Transition },
        }}
        sx={{
          '& .MuiPaper-root': {
            boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.2)', // Light-colored shadow for contrast
            backgroundColor: "var(--bg-color-white-black)"
          }
        }}
        keepMounted
        onClose={() => setIsResetButtonClicked(false)}
        aria-describedby="alert-dialog-slide-description">
        <DialogTitle sx={{
          margin: "1rem 0 1rem 1rem",
          padding: 0,
          fontSize: "1.5rem",
          fontWeight: "bolder",
          fontFamily: "Nunito",
          display: "flex",
          color: "var(--bg-color-black-white)",
          alignItems: "center"
        }} className="alert-dialog-title">
          {"Reset expense limit"}
        </DialogTitle>
        <DialogContent sx={{ margin: "0 1rem 1rem 1rem", padding: 0, }}>
          <DialogContentText sx={{ whiteSpace: 'pre-line' }} className="alert-dialog-description">
            {"Do you want to clear your expense limit settings?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 0, margin: "0 0 1rem 0" }}>
          <Button variant="contained" id="close-button" sx={{ marginRight: "0.5rem" }}
            onClick={() => setIsResetButtonClicked(false)}>Close</Button>
          <Button variant="outlined" id="confirm-button" className="manage-expenses-button"
            onClick={() => {
              handleResetClick();
              setIsResetButtonClicked(false);
            }}
          >Confirm</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  </div>);
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default ExpenseLimitAccordion;