import { useNavigate } from "react-router-dom";
import "./style/Login.css";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { isEmailValid, isPasswordValid, isUsernameValid, isVerificationCodeValid } from "../../utility/dataValidator.js";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import config from "../../configuration/config.js";
import CustomAlert from "../IndexComponent/CustomAlert.jsx";
import LoginBox from "./LoginBox.jsx";
import SignUpBox from "./SignUpBox.jsx";
import ChangePasswordBox from "./ChangePasswordBox.jsx";

const page = config.userInterface.accessPage;

function Login() {

  const [alertLabel, setAlertLabel] = useState(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isUsernameHovered, setIsUsernameHovered] = useState(false);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordHovered, setIsPasswordHovered] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordHovered, setIsConfirmPasswordHovered] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [isEmailHovered, setIsEmailHovered] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const [currentPage, setCurrentPage] = useState(page.LOGIN);
  const [isUserPresent, setIsUserPresent] = useState({ isUsernamePresent: true, isPasswordPresent: true, isEmailPresent: true });


  useEffect(() => {
    sessionStorage.setItem("isLoginPage", "true");
    axios.get(config.endpoints.login.AUTH)
      .then((response) => {
        if (response.status === 200 && response.data.isAuthenticated)
          navigate("/home");
      })
      .catch((error) => {
        console.error("Error fetching authentication status: ", error);
      });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isUsernameFocused || isPasswordFocused || isConfirmPasswordFocused || isEmailFocused) {
      if (currentPage === page.SIGN_UP)
        setIsUserPresent({ isUsernamePresent: false, isPasswordPresent: false, isEmailPresent: false });
      else
        setIsUserPresent({ isUsernamePresent: true, isPasswordPresent: true, isEmailPresent: true });
    }
  }, [currentPage, isConfirmPasswordFocused, isPasswordFocused, isUsernameFocused, isEmailFocused]);

  useEffect(() => {
    if (currentPage === page.SIGN_UP)
      setIsUserPresent({ isUsernamePresent: false, isPasswordPresent: false, isEmailPresent: false });
    else
      setIsUserPresent({ isUsernamePresent: true, isPasswordPresent: true, isEmailPresent: true });
  }, [currentPage]);

  function handleChange(e, field) {
    if (field === "username")
      setUsername(() => e.target.value);
    else if (field === "password")
      setPassword(() => e.target.value);
    else if (field === "confirmPassword")
      setConfirmPassword(() => e.target.value);
    else if (field === "email")
      setEmail(() => e.target.value);
  }

  function handleSignUpHyperLinkClick(hyperlink) {
    switch (hyperlink) {
      case page.SIGN_UP: setCurrentPage(page.SIGN_UP);
        break;
      case page.LOGIN: setCurrentPage(page.LOGIN);
        break;
      case page.FORGOT_PASSWORD: setCurrentPage(page.FORGOT_PASSWORD);
        break;
      default: break;
    }
  }

  function handleFormClick(isRememberMeChecked = false) {
    switch (currentPage) {
      case page.SIGN_UP:
        if (config.db.isQueryExecuting.login)
          break;

        config.db.isQueryExecuting.login = true;
        axios.get(`${config.endpoints.login.IS_USER_PRESENT}`, {
          params: {
            username: username,
            password: password,
            email: email,
            isLoginPage: false,
            isRememberMeChecked: isRememberMeChecked,
            isRequestFromScheduler: false
          }
        })
          .then((response) => {
            if (response.data.isUsernamePresent === true) {
              setIsUserPresent({ isUsernamePresent: true, isPasswordPresent: false, isEmailPresent: false });
              setAlertLabel(() => ({ text: "Username already Exist.", severity: config.alertSeverity.WARNING }));
              return null;
            }
            else if (response.data.isEmailPresentForDifferentUser === true || response.data.isEmailPresentForSameUser === true) {
              setIsUserPresent({ isUsernamePresent: false, isPasswordPresent: false, isEmailPresent: true });
              setAlertLabel(() => ({ text: "Email already registered.", severity: config.alertSeverity.WARNING }));
              return null;
            }
            return axios.post(`${config.endpoints.login.LOGIN}`, {
              username: username,
              password: password,
              email: email
            });
          })
          .then((response) => {
            if (response !== null && response.data.message === "Credential added successfully") {
              setCurrentPage(page.LOGIN);
              setAlertLabel(() => ({ text: "Account created successfully.", severity: config.alertSeverity.SUCCESS }));
            }
          })
          .catch((error) => {
            if (error.response && error.response.data && error.response.data.error)
              setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
            else
              setAlertLabel(() => ({ text: "Failed to create account.", severity: config.alertSeverity.ERROR }));
          })
          .finally(() => config.db.isQueryExecuting.login = false);
        break;
      case page.LOGIN:
        if (config.db.isQueryExecuting.login)
          break;
        config.db.isQueryExecuting.login = true;
        axios.get(`${config.endpoints.login.IS_USER_PRESENT}`, {
          params: {
            username: username,
            password: password,
            email: null,
            isLoginPage: true,
            isRememberMeChecked: isRememberMeChecked,
            isRequestFromScheduler: false
          }
        })
          .then(async (response) => {
            if (response.data.isUsernamePresent === false) {
              setIsUserPresent({ isUsernamePresent: false, isPasswordPresent: true, isEmailPresent: true });
              setAlertLabel(() => ({ text: "Username does not exist.", severity: config.alertSeverity.WARNING }));
            }
            else if (response.data.isPasswordPresent === false) {
              setIsUserPresent({ isUsernamePresent: true, isPasswordPresent: false, isEmailPresent: true });
              setAlertLabel(() => ({ text: "Incorrect Password.", severity: config.alertSeverity.WARNING }));
            }
            else {
              sessionStorage.setItem("isLoginPage", "false");
              navigate("/home");
            }
          })
          .catch((error) => {
            if (error.response && error.response.data && error.response.data.error)
              setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
            else
              setAlertLabel(() => ({ text: "Failed to verify user.", severity: config.alertSeverity.ERROR }));
          })
          .finally(() => config.db.isQueryExecuting.login = false);
        break;
      case page.FORGOT_PASSWORD:
        if (config.db.isQueryExecuting.login)
          break;

        config.db.isQueryExecuting.login = true;
        axios.put(`${config.endpoints.login.CHANGE_PASSWORD}`, {
          password: password,
          email: email
        })
          .then((response) => {
            setCurrentPage(() => page.LOGIN);
            setAlertLabel(() => ({ text: "Changed password successfully.", severity: config.alertSeverity.SUCCESS }));
          })
          .catch((error) => {
            if (error.response && error.response.data && error.response.data.error)
              setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
            else
              setAlertLabel(() => ({ text: "Failed to change password.", severity: config.alertSeverity.ERROR }));
          })
          .finally(() => config.db.isQueryExecuting.login = false);
        break;
      default:
    }
  }

  return (
    <>
      <div className="container">
        <div className="input-container">
          {currentPage === page.LOGIN &&
            <LoginBox
              username={username}
              handleChange={handleChange}
              isUsernameHovered={isUsernameHovered}
              setIsUsernameHovered={setIsUsernameHovered}
              isUsernameFocused={isUsernameFocused}
              setIsUsernameFocused={setIsUsernameFocused}
              isUserPresent={isUserPresent}
              password={password}
              isPasswordHovered={isPasswordHovered}
              setIsPasswordHovered={setIsPasswordHovered}
              isPasswordFocused={isPasswordFocused}
              setIsPasswordFocused={setIsPasswordFocused}
              setCurrentPage={setCurrentPage}
              handleFormClick={handleFormClick}
              handleSignUpHyperLinkClick={handleSignUpHyperLinkClick}
              setAlertLabel={setAlertLabel}>
            </LoginBox>}
          {currentPage === page.SIGN_UP &&
            <SignUpBox
              username={username}
              handleChange={handleChange}
              isUsernameHovered={isUsernameHovered}
              setIsUsernameHovered={setIsUsernameHovered}
              isUsernameFocused={isUsernameFocused}
              setIsUsernameFocused={setIsUsernameFocused}
              isUserPresent={isUserPresent}
              password={password}
              isPasswordHovered={isPasswordHovered}
              setIsPasswordHovered={setIsPasswordHovered}
              isPasswordFocused={isPasswordFocused}
              setIsPasswordFocused={setIsPasswordFocused}
              setCurrentPage={setCurrentPage}
              handleFormClick={handleFormClick}
              handleSignUpHyperLinkClick={handleSignUpHyperLinkClick}
              confirmPassword={confirmPassword}
              isConfirmPasswordHovered={isConfirmPasswordHovered}
              setIsConfirmPasswordHovered={setIsConfirmPasswordHovered}
              isConfirmPasswordFocused={isConfirmPasswordFocused}
              setIsConfirmPasswordFocused={setIsConfirmPasswordFocused}
              email={email}
              isEmailHovered={isEmailHovered}
              setIsEmailHovered={setIsEmailHovered}
              isEmailFocused={isEmailFocused}
              setIsEmailFocused={setIsEmailFocused}
              setAlertLabel={setAlertLabel}
            >
            </SignUpBox>}
          {currentPage === page.FORGOT_PASSWORD &&
            <ChangePasswordBox
              username={username}
              handleChange={handleChange}
              isUsernameHovered={isUsernameHovered}
              setIsUsernameHovered={setIsUsernameHovered}
              isUsernameFocused={isUsernameFocused}
              setIsUsernameFocused={setIsUsernameFocused}
              isUserPresent={isUserPresent}
              setIsUserPresent={setIsUserPresent}
              password={password}
              isPasswordHovered={isPasswordHovered}
              setIsPasswordHovered={setIsPasswordHovered}
              isPasswordFocused={isPasswordFocused}
              setIsPasswordFocused={setIsPasswordFocused}
              setCurrentPage={setCurrentPage}
              handleFormClick={handleFormClick}
              handleSignUpHyperLinkClick={handleSignUpHyperLinkClick}
              confirmPassword={confirmPassword}
              isConfirmPasswordHovered={isConfirmPasswordHovered}
              setIsConfirmPasswordHovered={setIsConfirmPasswordHovered}
              isConfirmPasswordFocused={isConfirmPasswordFocused}
              setIsConfirmPasswordFocused={setIsConfirmPasswordFocused}
              email={email}
              isEmailHovered={isEmailHovered}
              setIsEmailHovered={setIsEmailHovered}
              isEmailFocused={isEmailFocused}
              setIsEmailFocused={setIsEmailFocused}
              setAlertLabel={setAlertLabel}>
            </ChangePasswordBox>}
        </div>
        <div className="logo-container">
          <div className="logo-content">
            <img className="login-logo-image" src={require(`../../asset/logo/sparc_logo.png`)} alt="sparc logo" />
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10vh" }}>
              <span style={{ color: "#6237a0" }}>Spend...&nbsp;</span>
              <span style={{ color: "#9754cb" }}>Plan...&nbsp;</span>
              <span style={{ color: "#d592f4" }}>Record...</span>
            </div>

            <img className="logo-background-image" src={require(`../../asset/logo/logo_background.png`)} alt="sparc logo" />

          </div>
        </div>
      </div>
      <CustomAlert
        setAlertLabel={setAlertLabel}
        alertLabel={alertLabel}
      ></CustomAlert>
    </>
  );
}

export function InputUsernameField(props) {

  return (<TextField
    variant="outlined"
    label="Username*"
    name="username"
    value={props.username}
    sx={{
      ...inputFieldStyle,
      marginTop: "6vh",
      ...loginFieldStyle
    }}
    onMouseEnter={() => props.setIsHovered(true)}
    onMouseLeave={() => props.setIsHovered(false)}
    onFocus={() => props.setIsFocused(true)}
    onBlur={() => props.setIsFocused(false)}
    onChange={e => props.handleChange(e, "username")}
    slotProps={{
      input: {
        className:
          (props.currentPage === page.SIGN_UP && (!isUsernameValid(props.username).valid || props.isUsernamePresent)) || (props.currentPage === page.LOGIN && !props.isUsernamePresent)
            ? "input-field-outline-err"
            : "input-field-focused-outline",
      },
      inputLabel: {
        className:
          (props.currentPage === page.SIGN_UP && (!isUsernameValid(props.username).valid || props.isUsernamePresent)) || (props.currentPage === page.LOGIN && !props.isUsernamePresent)
            ? "input-field-label-err"
            : "input-field-focused-label",
      },
      formHelperText: {
        style: {
          fontSize: "0.8vw",
          color: "red"
        }
      }
    }}
    helperText={
      props.currentPage === page.SIGN_UP ?
        (props.isFocused && !isUsernameValid(props.username).valid
          ? isUsernameValid(props.username).message
          : (props.isUsernamePresent ? "Username already exist" : ""))
        : props.currentPage === page.LOGIN && !props.isUsernamePresent ? "Username does not exist" : ""}
  ></TextField>);
}

export function InputPasswordField(props) {

  const [showPassword, setShowPassword] = useState(false);

  return (<TextField
    variant="outlined"
    label={props.label + "*"}
    name="password"
    type={showPassword ? 'text' : 'password'}
    value={props.password}
    sx={{
      ...inputFieldStyle,
      ...loginFieldStyle,
      marginTop: "4vh",

    }}
    onMouseEnter={() => props.setIsHovered(true)}
    onMouseLeave={() => props.setIsHovered(false)}
    onFocus={() => props.setIsFocused(true)}
    onBlur={() => props.setIsFocused(false)}
    onChange={e => props.handleChange(e, props.label === "Password" ? "password" : "confirmPassword")}
    slotProps={{
      input: {
        className:
          (props.currentPage !== page.LOGIN && ((props.label === "Confirm Password" && props.password !== props.passwordToMatch) || !isPasswordValid(props.password).valid)) || (props.currentPage === page.LOGIN && !props.isPasswordPresent)
            ? "input-field-outline-err"
            : "input-field-focused-outline",
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
                color: props.isFocused ? "#6237a0" : (props.isHovered ? "#9754cb" : "inherit"),
                transition: "color 0.3s ease-in-out",
              }}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )
      },
      inputLabel: {
        className:
          (props.currentPage !== page.LOGIN && ((props.label === "Confirm Password" && props.password !== props.passwordToMatch) || !isPasswordValid(props.password).valid)) || (props.currentPage === page.LOGIN && !props.isPasswordPresent)
            ? "input-field-label-err"
            : "input-field-focused-label",
      },
      formHelperText: {
        style: {
          fontSize: "0.8vw",
          color: "red"
        }
      }
    }}
    helperText={
      props.isFocused && props.currentPage !== page.LOGIN ?
        (props.label === "Confirm Password" && props.password !== props.passwordToMatch ?
          "Passwords do not match" :
          (!isPasswordValid(props.password).valid ?
            isPasswordValid(props.password).message : "")
        ) : props.currentPage === page.LOGIN && !props.isPasswordPresent ? "Incorrect password" : ""}
  ></TextField>);
}

export function InputEmailField(props) {

  return (<TextField
    variant="outlined"
    label="Email*"
    name="email"
    value={props.email}
    sx={{
      ...inputFieldStyle,
      marginTop: "6vh",
      width: "100%",
      ...loginFieldStyle
    }}
    onMouseEnter={() => props.setIsHovered(true)}
    onMouseLeave={() => props.setIsHovered(false)}
    onFocus={() => props.setIsFocused(true)}
    onBlur={() => props.setIsFocused(false)}
    onChange={e => props.handleChange(e, "email")}
    slotProps={{
      input: {
        className:
          !isEmailValid(props.email).valid
            ? "input-field-outline-err"
            : "input-field-focused-outline",
      },
      inputLabel: {
        className:
          !isEmailValid(props.email).valid
            ? "input-field-label-err"
            : "input-field-focused-label",
      },
      formHelperText: {
        style: {
          fontSize: "0.8vw",
          color: "red"
        }
      }
    }}
    helperText={
      props.isFocused && !isEmailValid(props.email).valid
        ? isEmailValid(props.email).message
        : (props.currentPage === config.userInterface.accessPage.SIGN_UP && props.isEmailPresent ? "Email already registered" :
          (props.currentPage === config.userInterface.accessPage.FORGOT_PASSWORD && !props.isEmailPresent ? "Email not registered" : ""))}
  ></TextField>);
}

export function InputCodeField(props) {

  return (<TextField
    variant="outlined"
    label="Verification code*"
    name="code"
    value={props.code}
    sx={{
      marginTop: "6vh",
      ...loginFieldStyle,
      ...(props.isSendCodeClicked && inputFieldStyle),
      "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--bg-color-3)", // Change outline color for disabled state
      },
      "& .MuiInputLabel-root.Mui-disabled": {
        color: "var(--bg-color-3)", // Change label color for disabled state
      },
    }}

    disabled={!props.isSendCodeClicked}
    onFocus={() => props.setIsFocused(true)}
    onBlur={() => props.setIsFocused(false)}
    onChange={e => props.handleChange(() => e.target.value)}
    slotProps={{
      input: {
        className:
          !props.isSendCodeClicked ? "input-field-outline-disabled" :
            (!isVerificationCodeValid(props.code) || (props.isButtonClicked && !props.isCodeCorrect)
              ? "input-field-outline-err"
              : "input-field-focused-outline"),
      },
      inputLabel: {
        className:
          !props.isSendCodeClicked ? "input-field-label-disabled" :
            (!isVerificationCodeValid(props.code) || (props.isButtonClicked && !props.isCodeCorrect)
              ? "input-field-label-err"
              : "input-field-focused-label"),
      },
      formHelperText: {
        style: {
          fontSize: "0.8vw",
          color: "red"
        }
      }
    }}
    helperText={
      props.isFocused && !isVerificationCodeValid(props.code)
        ? "Invalid PIN"
        : (props.isButtonClicked && !props.isCodeCorrect ? "❌ Incorrect PIN" : "")}
  ></TextField>);
}

export const inputFieldStyle = {
  "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
  {
    borderColor: "#9754cb",
  },
  "&:hover .MuiInputLabel-root": {
    color: "#9754cb",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    color: "var(--bg-color-3)",
    "-webkit-text-fill-color": "var(--bg-color-3)"
  },
  input: {
    color: "var(--bg-color-black-white)",
    transition: "all 0.3s ease",
  },
  "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--bg-color-3)",
  },
}

export const loginFieldStyle = {
  "& .MuiInputLabel-root": {
    color: "var(--bg-color-2)",
  },
  "& .MuiOutlinedInput-root fieldset": {
    borderColor: "var(--bg-color-2)",
  }
}

export default Login;