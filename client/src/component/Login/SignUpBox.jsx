import { InputCodeField, InputEmailField, InputPasswordField, InputUsernameField } from "./Login";
import config from "../../configuration/config";
import { Button, IconButton, Tooltip } from "@mui/material";
import { isEmailValid, isPasswordValid, isUsernameValid, isVerificationCodeValid } from "../../utility/dataValidator";
import "./style/Login.css";
import { useEffect, useRef, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import axios from "axios";

function SignUpBox(props) {

    const [pageNumber, setPageNumber] = useState(1);
    const [code, setCode] = useState("");
    const [isCodeCorrect, setIsCodeCorrect] = useState(false);
    const [isSendCodeClicked, setIsSendCodeClicked] = useState(false);
    const [isSignUpClicked, setIsSignUpClicked] = useState(false);
    const [isCodeFocused, setIsCodeFocused] = useState(false);

    let correctCode = useRef("");

    useEffect(() => {
        if (props.isUserPresent.isUsernamePresent === true)
            setPageNumber(1);
        else if (props.isUserPresent.isEmailPresent === true)
            setPageNumber(2);

    }, [props.isUserPresent]);

    useEffect(() => {
        if (props.isEmailFocused || isCodeFocused)
            setIsSignUpClicked(() => false);
    }, [props.isEmailFocused, isCodeFocused]);

    function handleSendCodeClick() {
        setIsSendCodeClicked(() => true);

        config.db.isQueryExecuting.login = true;
        axios.get(`${config.endpoints.login.VERIFICATION_CODE}`, {
            params: {
                email: props.email,
                username: props.username
            }
        })
            .then((response) => {
                correctCode.current = response.data;
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error)
                    props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                else
                    props.setAlertLabel(() => ({ text: "Failed to send verification code.", severity: config.alertSeverity.ERROR }));
            })
            .finally(() => config.db.isQueryExecuting.login = false);

    }

    function handleSignUpClick() {
        setIsSignUpClicked(() => true);
        setIsCodeCorrect(() => correctCode.current === code);

        if (correctCode.current === code)
            props.handleFormClick();
    }

    return (
        <div id="sign-up-box" className="input-box">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="input-box-heading">Sign Up</span>
                <div className="page-number-container">
                    <div style={{ color: pageNumber === 1 ? "var(--bg-color-3)" : "#6237a0", cursor: pageNumber === 2 ? "pointer" : null }}
                        onClick={() => pageNumber === 2 && setPageNumber(1)}><ArrowBackIcon>
                        </ArrowBackIcon></div>
                    <span>page {pageNumber} of 2</span>
                </div>
            </div>
            {pageNumber === 1 ?
                (<>
                    <InputUsernameField
                        username={props.username}
                        handleChange={props.handleChange}
                        isHovered={props.isUsernameHovered}
                        setIsHovered={props.setIsUsernameHovered}
                        isFocused={props.isUsernameFocused}
                        setIsFocused={props.setIsUsernameFocused}
                        currentPage={config.userInterface.accessPage.SIGN_UP}
                        isUsernamePresent={props.isUserPresent.isUsernamePresent}>
                    </InputUsernameField>
                    <InputPasswordField
                        password={props.password}
                        handleChange={props.handleChange}
                        isHovered={props.isPasswordHovered}
                        setIsHovered={props.setIsPasswordHovered}
                        isFocused={props.isPasswordFocused}
                        setIsFocused={props.setIsPasswordFocused}
                        currentPage={config.userInterface.accessPage.SIGN_UP}
                        isPasswordPresent={props.isUserPresent.isPasswordPresent}
                        label={"Password"}>
                    </InputPasswordField>
                    <InputPasswordField
                        password={props.confirmPassword}
                        passwordToMatch={props.password}
                        handleChange={props.handleChange}
                        isHovered={props.isConfirmPasswordHovered}
                        setIsHovered={props.setIsConfirmPasswordHovered}
                        isFocused={props.isConfirmPasswordFocused}
                        setIsFocused={props.setIsConfirmPasswordFocused}
                        label={"Confirm Password"}
                        currentPage={config.userInterface.accessPage.SIGN_UP}>
                    </InputPasswordField>
                    <Button
                        disabled={!isUsernameValid(props.username).valid || !isPasswordValid(props.password).valid || props.password !== props.confirmPassword}
                        onClick={() => setPageNumber(2)}
                        variant="contained"
                        className={["login-component-button", !isUsernameValid(props.username).valid || !isPasswordValid(props.password).valid || props.password !== props.confirmPassword ? "disabled-login-button" : ""].join(' ')}
                    >
                        Next
                    </Button>
                </>) :
                (<>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1vw", width: "100%", alignItems: "center" }}>
                        <InputEmailField
                            email={props.email}
                            handleChange={props.handleChange}
                            isHovered={props.isEmailHovered}
                            setIsHovered={props.setIsEmailHovered}
                            isFocused={props.isEmailFocused}
                            setIsFocused={props.setIsEmailFocused}
                            isEmailPresent={props.isUserPresent.isEmailPresent}
                            currentPage={config.userInterface.accessPage.FORGOT_PASSWORD}>
                        </InputEmailField>
                        <SendCodeButton
                            handleSendCodeClick={handleSendCodeClick}
                            email={props.email}>
                        </SendCodeButton>
                    </div>
                    <InputCodeField
                        code={code}
                        handleChange={setCode}
                        isCodeCorrect={isCodeCorrect}
                        isSendCodeClicked={isSendCodeClicked}
                        isButtonClicked={isSignUpClicked}
                        isFocused={isCodeFocused}
                        setIsFocused={setIsCodeFocused}>
                    </InputCodeField>
                    <Button
                        sx={{ marginTop: "4vh !important" }}
                        disabled={!isUsernameValid(props.username).valid || !isPasswordValid(props.password).valid || props.password !== props.confirmPassword || !isEmailValid(props.email).valid || !isVerificationCodeValid(code)}
                        onClick={() => handleSignUpClick()}
                        variant="contained"
                        className={["login-component-button", !isUsernameValid(props.username).valid || !isPasswordValid(props.password).valid || props.password !== props.confirmPassword || !isEmailValid(props.email).valid || !isVerificationCodeValid(code) ? "disabled-login-button" : ""].join(' ')}
                    >
                        Sign up
                    </Button>
                </>)}
            <span className="login-footer">Already have an account? <span className="sign-up-hyperlink"
                onClick={() => props.handleSignUpHyperLinkClick(config.userInterface.accessPage.LOGIN)}>
                {config.userInterface.accessPage.LOGIN}
            </span>
            </span>
        </div>
    );
}

export function SendCodeButton(props) {

    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [countdown]);

    return (
        <div className="send-code-button-container">
            <Tooltip title={"Send verification code"}>
                <IconButton
                    style={{ position: "relative" }}
                    className={["login-component-button", !isEmailValid(props.email).valid || countdown > 0 ? "disabled-login-button" : ""].join(' ')}
                    disabled={!isEmailValid(props.email).valid || countdown > 0}
                    onClick={() => {
                        setCountdown(60);
                        props.handleSendCodeClick();
                    }}>
                    <EmailIcon sx={{ width: "100%", height: "100%", opacity: countdown > 0 ? 0.4 : 1 }} />
                    {countdown > 0 && (
                        <span className="countdown-overlay">{countdown}</span>
                    )}
                </IconButton>
            </Tooltip>
        </div>
    );
}
export default SignUpBox;