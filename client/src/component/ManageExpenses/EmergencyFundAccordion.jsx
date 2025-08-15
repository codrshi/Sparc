import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, Slide, Stack, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "./style/ManageExpenses.css";
import { isAmountValid, isPercentageValid } from "../../utility/dataValidator.js";
import config from "../../configuration/config.js";
import axios from "axios";
import { AntSwitch } from "./ManageExpenses.jsx";

function EmergencyFundAccordion(props) {

  const [emergencyFund, setEmergencyFund] = useState({
    isEnabled: false,
    targetAmount: 0,
    amount: 0,
    percentageValue: 10
  });
  const savedState = useRef(null);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isResetButtonClicked, setIsResetButtonClicked] = useState(false);

  useEffect(() => {

    if (config.db.isQueryExecuting.emergencyFund || savedState.current !== null)
      return;

    config.db.isQueryExecuting.emergencyFund = true;
    axios.get(config.endpoints.manageExpenses.EMERGENCY_FUND)
      .then((response) => {
        setEmergencyFund(() => response.data);
        savedState.current = response.data;
        console.log(response.data)
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to fetch content.", severity: config.alertSeverity.ERROR }));
      })
      .finally(() => { config.db.isQueryExecuting.emergencyFund = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedState]);

  useEffect(() => {
    setIsButtonEnabled(() => {
      if (emergencyFund.isEnabled) {
        if (emergencyFund.amount === "" || !isAmountValid(emergencyFund.amount))
          return false;
        if (emergencyFund.targetAmount === "" || !isAmountValid(emergencyFund.targetAmount))
          return false;
        if (emergencyFund.percentageValue === "" || !isPercentageValid(emergencyFund.percentageValue))
          return false;
      }
      return JSON.stringify(savedState.current) !== JSON.stringify(emergencyFund);
    });
  }, [savedState, emergencyFund]);

  function handleChange(field, value) {
    setEmergencyFund({ ...emergencyFund, [field]: value });
  }

  function handleSaveClick(emergencyFund) {

    if (config.db.isQueryExecuting.emergencyFund)
      return;

    config.db.isQueryExecuting.emergencyFund = true;
    axios.put(config.endpoints.manageExpenses.EMERGENCY_FUND, emergencyFund)
      .then((response) => {
        savedState.current = emergencyFund;
        props.setAlertLabel(() => ({ text: "Changes saved.", severity: "success" }));
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to save changes.", severity: config.alertSeverity.ERROR }));
      })
      .finally(() => {
        config.db.isQueryExecuting.emergencyFund = false;
        setIsButtonEnabled(() => false);
      });
  }

  function handleResetClick() {
    const defaultEmergencyFund = {
      ...emergencyFund,
      isEnabled: false,
      percentageValue: config.db.emergencyFund.DEFAULT_PERCENTAGE_VALUE,
      targetAmount: emergencyFund.defaultTargetAmount,
    };

    setEmergencyFund(() => defaultEmergencyFund)
    handleSaveClick(defaultEmergencyFund);
  }

  return (<div id="set-emergency-fund" className="board-body-component">
    <Accordion sx={{ width: "100%" }}>
      <AccordionSummary
        expandIcon={< ExpandMoreIcon sx={{ color: 'var(--bg-color-2)', transition: "all 0.3s ease" }} />}
        aria-controls="panel1-content"
        sx={{ fontWeight: 600, fontSize: "1.2rem", color: "var(--bg-color-black-white)", backgroundColor: "var(--bg-color-white-black)", transition: "all 0.3s ease" }}>
        Your emergency fund
      </AccordionSummary>
      <AccordionDetails>
        <div className="board-body-component-accordion-content">
          <span>An emergency fund is a financial safety net designed to cover unexpected expenses or financial emergencies. By default, 10% of monthly savings is allocated to your emergency fund until it becomes equal to three months' worth of expenses.</span>

          <div className="board-body-component-accordion-content-component">
            <span>Enable emergency fund</span>
            <Stack
              direction="row"
              spacing={"0.5rem"}>
              <AntSwitch
                checked={emergencyFund.isEnabled}
                onChange={() => handleChange('isEnabled', !emergencyFund.isEnabled)}
                inputProps={{ 'aria-label': 'ant design' }} />
            </Stack>
          </div>
          <div className="board-body-component-accordion-content-component">
            <span>Emergency fund goal</span>
            <TextField
              className="input-text-field"
              variant="standard"
              value={emergencyFund.targetAmount}
              sx={{
                ...props.inputFieldStyle,
                "& .MuiFormHelperText-root": {
                  visibility: "hidden", // Hide helper text by default
                },
                "& .Mui-focused + .MuiFormHelperText-root": {
                  visibility: "visible", // Show helper text when TextField is focused
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><span className={emergencyFund.isEnabled ? "rupee-icon" : "rupee-icon-disabled"}>₹</span></InputAdornment>
                  ),
                  sx: {
                    '&:after': {
                      borderBottomColor: isAmountValid(emergencyFund.targetAmount) ? '#6237a0' : 'red', // Color when focused
                    },
                    '&:before': {
                      borderBottomColor: !isAmountValid(emergencyFund.targetAmount) ? 'red' : 'var(--bg-color-2)', // Default color
                    },
                    '&:hover:not(.Mui-disabled):before': {
                      borderBottomColor: '#9754cb', // Hover color
                    },
                  }
                }
              }}
              disabled={!emergencyFund.isEnabled}
              onChange={(e) => handleChange('targetAmount', e.target.value)}
            >
            </TextField>
          </div>
          <div className="board-body-component-accordion-content-component">
            <span>Emergency fund value</span>
            <TextField
              className="input-text-field"
              variant="standard"
              value={emergencyFund.amount}
              sx={{
                ...props.inputFieldStyle,
                "& .MuiFormHelperText-root": {
                  visibility: "hidden", // Hide helper text by default
                },
                "& .Mui-focused + .MuiFormHelperText-root": {
                  visibility: "visible", // Show helper text when TextField is focused
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start"><span className={emergencyFund.isEnabled ? "rupee-icon" : "rupee-icon-disabled"}>₹</span></InputAdornment>
                  ),
                  sx: {
                    '&:after': {
                      borderBottomColor: isAmountValid(emergencyFund.amount) ? '#6237a0' : 'red', // Color when focused
                    },
                    '&:before': {
                      borderBottomColor: !isAmountValid(emergencyFund.amount) ? 'red' : 'var(--bg-color-2)', // Default color
                    },
                    '&:hover:not(.Mui-disabled):before': {
                      borderBottomColor: '#9754cb', // Hover color
                    }
                  }
                }
              }}
              disabled={!emergencyFund.isEnabled}
              onChange={(e) => handleChange('amount', e.target.value)}
            >
            </TextField>
          </div>
          <div className="board-body-component-accordion-content-component">
            <span>Percentage of monthly savings to allocate for emergency fund</span>
            <TextField
              className="input-text-field"
              variant="standard"
              value={emergencyFund.percentageValue}
              sx={{
                ...props.inputFieldStyle,
                "& .MuiFormHelperText-root": {
                  visibility: "hidden", // Hide helper text by default
                },
                "& .Mui-focused + .MuiFormHelperText-root": {
                  visibility: "visible", // Show helper text when TextField is focused
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start"><span className={emergencyFund.isEnabled ? "percentage-icon" : "percentage-icon-disabled"}>%</span></InputAdornment>
                  ),
                  sx: {
                    '&:after': {
                      borderBottomColor: isPercentageValid(emergencyFund.percentageValue) ? '#6237a0' : 'red', // Color when focused
                    },
                    '&:before': {
                      borderBottomColor: !isPercentageValid(emergencyFund.percentageValue) ? 'red' : 'var(--bg-color-2)', // Default color
                    },
                    '&:hover:not(.Mui-disabled):before': {
                      borderBottomColor: '#9754cb', // Hover color
                    }
                  }
                }
              }}
              disabled={!emergencyFund.isEnabled}
              onChange={(e) => handleChange('percentageValue', e.target.value)}
            >
            </TextField>
          </div>
          <div id="button-section" className="board-body-component">
            <Button
              variant="outlined"
              id={isButtonEnabled
                ? "enabled-save-button"
                : "disabled-save-button"}
              className="manage-expenses-button"
              disabled={!isButtonEnabled}
              onClick={() => handleSaveClick(emergencyFund)}>
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
        keepMounted
        slotProps={{
          transition: { Transition }
        }}
        sx={{
          '& .MuiPaper-root': {
            boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.2)', // Light-colored shadow for contrast
            backgroundColor: "var(--bg-color-white-black)"
          }
        }}
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
          {"Reset emergency fund"}
        </DialogTitle>
        <DialogContent sx={{ margin: "0 1rem 1rem 1rem", padding: 0 }}>
          <DialogContentText sx={{ whiteSpace: 'pre-line' }} className="alert-dialog-description">
            {"Do you want to clear your emergency fund settings?"}
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

export default EmergencyFundAccordion;