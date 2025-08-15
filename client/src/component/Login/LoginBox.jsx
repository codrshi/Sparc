import { useState } from "react";
import { InputPasswordField, InputUsernameField } from "./Login";
import config from "../../configuration/config";
import { Button } from "@mui/material";
import { isPasswordValid, isUsernameValid } from "../../utility/dataValidator";
import "./style/Login.css";

function LoginBox(props) {

    const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);

    function handleLoginClick() {
        props.handleFormClick(isRememberMeChecked ? "true" : "false");
    }
    return (
        <div id="login-box" className="input-box">
            <span className="input-box-heading">Login</span>
            <InputUsernameField
                username={props.username}
                handleChange={props.handleChange}
                isHovered={props.isUsernameHovered}
                setIsHovered={props.setIsUsernameHovered}
                isFocused={props.isUsernameFocused}
                setIsFocused={props.setIsUsernameFocused}
                currentPage={config.userInterface.accessPage.LOGIN}
                isUsernamePresent={props.isUserPresent.isUsernamePresent}>
            </InputUsernameField>
            <InputPasswordField
                password={props.password}
                handleChange={props.handleChange}
                isHovered={props.isPasswordHovered}
                setIsHovered={props.setIsPasswordHovered}
                isFocused={props.isPasswordFocused}
                setIsFocused={props.setIsPasswordFocused}
                currentPage={config.userInterface.accessPage.LOGIN}
                isPasswordPresent={props.isUserPresent.isPasswordPresent}
                label={"Password"}>
            </InputPasswordField>
            <div style={{ display: "flex", marginTop: "4vh", justifyContent: "space-between" }}>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={isRememberMeChecked}
                        onChange={() => { setIsRememberMeChecked(!isRememberMeChecked) }}
                    />
                    Remember Me
                </label>
                <span className="forgot-password-hyperlink"
                    onClick={() => { props.handleSignUpHyperLinkClick(config.userInterface.accessPage.FORGOT_PASSWORD) }}>Forgot Password?</span>
            </div>
            <Button
                disabled={!isUsernameValid(props.username).valid || !isPasswordValid(props.password).valid}
                onClick={() => handleLoginClick()}
                variant="contained"
                className={["login-component-button", !isUsernameValid(props.username).valid || !isPasswordValid(props.password).valid ? "disabled-login-button" : ""].join(' ')}
            >
                Login
            </Button>
            <span className="login-footer">Does'nt have an account yet? <span className="sign-up-hyperlink"
                onClick={() => props.handleSignUpHyperLinkClick(config.userInterface.accessPage.SIGN_UP)}>
                {config.userInterface.accessPage.SIGN_UP}
            </span>
            </span>
        </div>
    );
}

export default LoginBox;