import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, Slide, Stack, TextField } from "@mui/material";
import { inputFieldStyle } from "../Login/Login";
import { isEmailValid, isPasswordValid, isUsernameValid } from "../../utility/dataValidator.js";
import React, { useContext, useEffect, useRef, useState } from "react";
import config from "../../configuration/config.js";
import axios from "axios";
import "./style/Settings.css";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AntSwitch } from "../ManageExpenses/ManageExpenses.jsx";
import CloseIcon from '@mui/icons-material/Close';
import { UserDataChangeCounterContext } from "../IndexComponent/App.jsx";
import { useNavigate } from "react-router-dom";
import { transactionFormFieldStyle } from "../myTransactionSectionComponent/TransactionForm/TransactionFormBody.jsx";

const button = Object.freeze({
  SAVE: 'Save',
  DELETE_ACCOUNT: 'Delete account',
  LOGOUT: 'Logout'
});

function Settings(props) {

  const { userDataChangeCounter, setUserDataChangeCounter } = useContext(UserDataChangeCounterContext);

  const [settings, setSettings] = useState({
    username: "",
    email: "",
    isTipEnabled: true,
    isExportReportEnabled: true,
    profilePicture: null
  });
  const savedState = useRef(null);
  const [isUsernamePresent, setIsUsernamePresent] = useState(false);
  const [isEmailPresent, setIsEmailPresent] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [buttonClicked, setButtonClicked] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (config.db.isQueryExecuting.settings || savedState.current !== null)
      return;

    config.db.isQueryExecuting.settings = true;
    axios.get(`${config.endpoints.settings.CREDENTIAL}`, {
    })
      .then((response) => {
        setSettings(() => response.data);
        savedState.current = response.data;
        console.log(response.data)
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to fetch data.", severity: config.alertSeverity.ERROR }));
      })
      .finally(() => { config.db.isQueryExecuting.settings = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsButtonDisabled(() =>
      !isUsernameValid(settings.username).valid || JSON.stringify(settings) === JSON.stringify(savedState.current));
  }, [settings]);

  function handleChange(value, field) {
    setSettings(() => ({ ...settings, [field]: value }));
  }

  function handleSaveClick(password) {
    const formData = new FormData();
    formData.append("username", settings.username);
    formData.append("email", settings.email);
    formData.append("isTipEnabled", settings.isTipEnabled);
    formData.append("isExportReportEnabled", settings.isExportReportEnabled);
    formData.append("profilePicture", settings.profilePicture);
    formData.append("password", password);

    axios.put(config.endpoints.settings.CREDENTIAL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((response) => {
        const alertMessage = response.data.alertMessage;
        const severity = response.data.severity;

        props.setAlertLabel(() => ({ text: alertMessage, severity: severity }));
        if (severity === config.alertSeverity.SUCCESS) {
          savedState.current = settings;

          if (response.data.accessToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.accessToken}`;
          }

          setUserDataChangeCounter(() => userDataChangeCounter + 1);
        }
        else if (alertMessage.startsWith("Username"))
          setIsUsernamePresent(true);
        else if (alertMessage.startsWith("Email"))
          setIsEmailPresent(true);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to change settings.", severity: config.alertSeverity.ERROR }));
      })
  }

  function handleLogoutClick() {

    axios.post(config.endpoints.settings.LOGOUT)
      .then((response) => {
        props.setAlertLabel(() => ({ text: response.data.alertMessage, severity: response.data.severity }));
        navigate("/");
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to logout.", severity: config.alertSeverity.ERROR }));
      })
  }

  function handleDeleteAccountClick() {
    axios.delete(config.endpoints.settings.DELETE_ACCOUNT)
      .then((response) => {
        const alertMessage = response.data.alertMessage;
        const severity = response.data.severity;

        props.setAlertLabel(() => ({ text: alertMessage, severity: severity }));
        if (severity === config.alertSeverity.SUCCESS) {
          navigate("/");
        }
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to delete account.", severity: config.alertSeverity.ERROR }));
      })
  }
  return (
    <>
      <div className="board-header">
        <span>Settings</span>
      </div>
      <div className="board-body">
        <div className="settings-body-component">
          <div className="settings-field">
            <span>Change Username</span>
            <ChangeField
              fieldName="username"
              fieldValue={settings.username}
              helperText={isUsernamePresent ? "Username already exist" : ""}
              isFieldValid={isUsernameValid}
              handleChange={handleChange}
              setIsPresent={setIsUsernamePresent}>
            </ChangeField>
          </div>
          <div className="settings-field">
            <span>Change Email</span>
            <ChangeField
              fieldName="email"
              fieldValue={settings.email}
              helperText={isEmailPresent ? "Email already registered" : ""}
              isFieldValid={isEmailValid}
              handleChange={handleChange}
              setIsPresent={setIsEmailPresent}>
            </ChangeField>
          </div>
          <ChangeProfilePicture
            handleChange={handleChange}
          >
          </ChangeProfilePicture>
          <div className="settings-field">
            <span>Enable/Disable tips in dashboard</span>
            <Stack
              direction="row"
              spacing={"0.5rem"}>
              <AntSwitch
                checked={settings.isTipEnabled}
                onChange={() => handleChange(!settings.isTipEnabled, "isTipEnabled")}
                inputProps={{ 'aria-label': 'ant design' }} />
            </Stack>
          </div>
          <div className="settings-field">
            <span>Allow application to send monthly report to your mail?</span>
            <Stack
              direction="row"
              spacing={"0.5rem"}>
              <AntSwitch
                checked={settings.isExportReportEnabled}
                onChange={() => handleChange(!settings.isExportReportEnabled, "isExportReportEnabled")}
                inputProps={{ 'aria-label': 'ant design' }} />
            </Stack>
          </div>
          <div className="settings-field">
            <span>Logout</span>
            <Button
              variant="outlined"
              className="settings-button"
              id="log-account-button"
              onClick={() => setButtonClicked(button.LOGOUT)}
            >
              Logout
            </Button>
          </div>
          <div className="settings-field">
            <span>Delete account</span>
            <Button
              variant="outlined"
              className="settings-button"
              id="delete-account-button"
              onClick={() => setButtonClicked(button.DELETE_ACCOUNT)}
            >
              Delete
            </Button>
          </div>
          <Button
            variant="outlined"
            id={
              isButtonDisabled
                ? 'disabled-save-settings-button'
                : 'enabled-save-settings-button'}
            className="settings-button"
            disabled={isButtonDisabled}
            onClick={() => setButtonClicked(button.SAVE)}
          >
            Save
          </Button>
          {buttonClicked !== null &&
            <ConfirmDialogBox
              buttonClicked={buttonClicked}
              setButtonClicked={setButtonClicked}
              setIsButtonDisabled={setIsButtonDisabled}
              setAlertLabel={props.setAlertLabel}
              settings={settings}
              handleSaveClick={handleSaveClick}
              handleLogoutClick={handleLogoutClick}
              handleDeleteAccountClick={handleDeleteAccountClick}>
            </ConfirmDialogBox>}
        </div>
      </div>
    </>);
}

function ChangeProfilePicture(props) {

  const [previewUrl, setPreviewUrl] = useState(null);

  function handleFileChange(event) {
    let file = event.target.files[0];
    props.handleChange(file, "profilePicture");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (<div className="settings-field">
    <span>Change profile picture</span>
    <div>
      <div className="file-upload-container">
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ fontFamily: "Nunito", fontSize: "1vw" }}
          onChange={(event) => handleFileChange(event)}
          hidden />
        <label htmlFor="fileInput" className="choose-image-button" style={{ cursor: "pointer" }}>
          Choose Image
        </label>
      </div>
      {previewUrl && (
        <div className="preview-image-body">
          <h4>Preview:</h4>
          <div className="preview-image-container">
            <CloseIcon
              className="cancel-image-icon"
            ></CloseIcon>
            <img
              className="preview-image"
              src={previewUrl}
              alt="Selected"
              onClick={() => {
                setPreviewUrl(null);
                props.handleChange(null, "profilePicture");
              }}
            />
          </div>
        </div>
      )}
    </div>
  </div>);
}

function ChangeField(props) {

  return (<TextField
    variant="filled"
    name={props.field}
    value={props.fieldValue}
    sx={{
      ...inputFieldStyle,
      "& .MuiFilledInput-root::after": {
        borderBottom: props.isFieldValid(props.fieldValue).valid ? "2px solid #6237a0 !important" : "2px solid red !important",
      },
    }}
    onFocus={() => props.setIsPresent(false)}
    onClick={() => props.setIsPresent(false)}
    onChange={e => props.handleChange(e.target.value, [props.fieldName])}
    slotProps={{
      formHelperText: {
        style: {
          fontSize: "0.8vw",
          color: "red"
        }
      }
    }}
    helperText={
      !props.isFieldValid(props.fieldValue).valid
        ? props.isFieldValid(props.fieldValue).message
        : props.helperText}
  >
  </TextField>);
}

function ConfirmDialogBox(props) {

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

  function handleConfirmClick() {
    if (props.buttonClicked === button.LOGOUT) {
      props.handleLogoutClick();
    }
    else if (!isPasswordValid(password).valid) {
      props.setAlertLabel(() => ({ text: "Incorrect Password.", severity: config.alertSeverity.WARNING }));
    }
    else if (props.buttonClicked === button.DELETE_ACCOUNT) {
      props.handleDeleteAccountClick();
    }
    else if (props.buttonClicked === button.SAVE) {
      props.handleSaveClick(password);
    }

    props.setIsButtonDisabled(false);
    props.setButtonClicked(null);
  }

  return (<React.Fragment>
    <Dialog
      open={props.buttonClicked !== null}
      slotProps={{
        transition: { Transition }
      }}
      sx={{
        '& .MuiPaper-root': {
          boxShadow: '0px 4px 10px rgba(255, 255, 255, 0.2)', // Light-colored shadow for contrast
          backgroundColor: "var(--bg-color-white-black)"
        }
      }}
      keepMounted
      onClose={() => props.setButtonClicked(null)}
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
        {props.buttonClicked}
      </DialogTitle>
      <DialogContent sx={{ margin: "0 1rem 1rem 1rem", padding: 0 }}>
        <DialogContentText sx={{ whiteSpace: 'pre-line' }} className="alert-dialog-description">
          <span>{props.buttonClicked !== button.LOGOUT ? "Enter your password to confirm changes" : "Are you sure you want to log out"}</span>
          {props.buttonClicked !== button.LOGOUT && <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
            <TextField
              variant="outlined"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              sx={{
                ...inputFieldStyle,
                marginTop: "4vh",
                ...transactionFormFieldStyle()
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onChange={e => setPassword(e.target.value)}
              slotProps={{
                input: {
                  className: "input-field-focused-outline",
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={
                          showPassword ? 'hide the password' : 'display the password'
                        }
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={e => e.preventDefault()}
                        onMouseUp={e => e.preventDefault()}
                        edge="end"
                        sx={{
                          color: props.isFocused ? "#6237a0" : (isHovered ? "#9754cb" : "inherit"),
                          transition: "color 0.3s ease-in-out",
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                },
                formHelperText: {
                  style: {
                    fontSize: "0.8vw",
                    color: "red"
                  }
                }
              }}>
            </TextField>
          </div>}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: 0, margin: "0 0 1rem 0" }}>
        <Button variant="contained" id="settings-close-button" sx={{ marginRight: "0.5rem" }}
          onClick={() => props.setButtonClicked(null)}>Close</Button>
        <Button variant="outlined" className={props.buttonClicked !== button.LOGOUT && password === "" ? "settings-confirm-button-disabled" : "settings-confirm-button-enabled"}
          disabled={props.buttonClicked !== button.LOGOUT && password === ""}
          onClick={() => {
            handleConfirmClick();
          }}
        >Confirm</Button>
      </DialogActions>
    </Dialog>
  </React.Fragment>);
}

export default Settings;