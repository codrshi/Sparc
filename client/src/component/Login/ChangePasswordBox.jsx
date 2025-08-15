import { useRef, useState } from "react";
import config from "../../configuration/config";
import { InputCodeField, InputEmailField, InputPasswordField } from "./Login";
import "./style/Login.css";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SendCodeButton } from "./SignUpBox";
import { Button } from "@mui/material";
import { isEmailValid, isPasswordValid, isVerificationCodeValid } from "../../utility/dataValidator";
import axios from "axios";

function ChangePasswordBox(props) {

    const [pageNumber, setPageNumber] = useState(1);
    const [code, setCode] = useState("");
    const [isCodeCorrect, setIsCodeCorrect] = useState(false);
    const [isSendCodeClicked, setIsSendCodeClicked] = useState(false);
    const [isCodeFocused, setIsCodeFocused] = useState(false);
    const [isNextClicked, setIsNextClicked] = useState(false);

    let correctCode = useRef("");

    function handleSendCodeClick() {
        setIsSendCodeClicked(() => true);

        config.db.isQueryExecuting.login = true;
        axios.get(`${config.endpoints.login.VERIFY_EMAIL}`, {
            params: {
                email: props.email
            }
        })
            .then((response) => {
                if (response.data === "-1") {
                    props.setIsUserPresent(() => ({
                        ...props.isUserPresent,
                        isEmailPresent: false
                    }));
                    console.log("here")
                }
                correctCode.current = response.data;
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error)
                    props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                else
                    props.setAlertLabel(() => ({ text: "Failed to verify email.", severity: config.alertSeverity.ERROR }));
            })
            .finally(() => config.db.isQueryExecuting.login = false);
    }

    function handleNextClick() {
        setIsNextClicked(() => true);
        if (correctCode.current === code) {
            setIsCodeCorrect(() => true);
            setPageNumber(() => 2);
        }
    }

    return (
        <div id="change-password-box" className="input-box">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="input-box-heading">Change Password</span>
                <div className="page-number-container">
                    <div style={{ color: pageNumber === 1 ? "var(--bg-color-3)" : "#6237a0", cursor: pageNumber === 2 ? "pointer" : null }}
                        onClick={() => pageNumber === 2 && setPageNumber(1)}>
                        <ArrowBackIcon>
                        </ArrowBackIcon>
                    </div>
                    <span>page {pageNumber} of 2</span>
                </div>
            </div>
            {pageNumber === 1 ?
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
                        isButtonClicked={isNextClicked}
                        isFocused={isCodeFocused}
                        setIsFocused={setIsCodeFocused}>
                    </InputCodeField>
                    <Button
                        sx={{ marginTop: "4vh !important" }}
                        disabled={!isEmailValid(props.email).valid || !isVerificationCodeValid(code)}
                        onClick={() => handleNextClick()}
                        variant="contained"
                        className={["login-component-button", !isEmailValid(props.email).valid || !isVerificationCodeValid(code) ? "disabled-login-button" : ""].join(' ')}
                    >
                        Next
                    </Button>
                </>) :
                (<>
                    <InputPasswordField
                        password={props.password}
                        handleChange={props.handleChange}
                        isHovered={props.isPasswordHovered}
                        setIsHovered={props.setIsPasswordHovered}
                        isFocused={props.isPasswordFocused}
                        setIsFocused={props.setIsPasswordFocused}
                        currentPage={config.userInterface.accessPage.FORGOT_PASSWORD}
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
                        currentPage={config.userInterface.accessPage.FORGOT_PASSWORD}>
                    </InputPasswordField>
                    <Button
                        sx={{ marginTop: "4vh !important" }}
                        disabled={!isEmailValid(props.email).valid || !isCodeCorrect || !isPasswordValid(props.password).valid || props.password !== props.confirmPassword}
                        onClick={() => props.handleFormClick()}
                        variant="contained"
                        className={["login-component-button", !isEmailValid(props.email).valid || !isCodeCorrect || !isPasswordValid(props.password).valid || props.password !== props.confirmPassword ? "disabled-login-button" : ""].join(' ')}
                    >
                        Confirm
                    </Button>
                </>)}
        </div>
    );
}

export default ChangePasswordBox;