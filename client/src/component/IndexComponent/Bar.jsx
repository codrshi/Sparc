import React, { useEffect, useState } from "react";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import "./style/Bar.css";
import config from "../../configuration/config.js";
import getCookie from "../../utility/cookieFieldFetcher.js";
import { IconButton, Tooltip } from "@mui/material";

function Bar(props) {

    const [isImageClicked, setIsImageClicked] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [barData, setBarData] = useState({
        username: getCookie(config.userInterface.cookieFields.USERNAME),
        profilePictureURL: getCookie(config.userInterface.cookieFields.PROFILE_PICTURE_URL)
    });

    useEffect(() => {
        setBarData({
            username: getCookie(config.userInterface.cookieFields.USERNAME),
            profilePictureURL: getCookie(config.userInterface.cookieFields.PROFILE_PICTURE_URL)
        });

    }, [props.userDataChangeCounter]);

    useEffect(() => {
        if (isDarkMode)
            document.body.classList.add("dark-mode");
        else
            document.body.classList.remove("dark-mode");
    }, [isDarkMode]);

    return <div className="bar">
        <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
            <IconButton id="theme-bar-button" className="bar-button" onClick={() => setIsDarkMode((prevMode) => !prevMode)}>
                {isDarkMode ? <LightModeIcon id="theme-icon"></LightModeIcon> : <DarkModeIcon id="theme-icon"></DarkModeIcon>}
            </IconButton>
        </Tooltip>
        <img className="logo-image"
            src={require(`../../asset/logo/sparc_logo.png`)}
            alt="sparc logo">
        </img>
        <UserSection
            username={barData.username}
            profilePictureUrl={barData.profilePictureURL}
            setIsImageClicked={setIsImageClicked}>
        </UserSection>
        {isImageClicked &&
            <div className="profile-picture-clicked-overlay" onClick={() => setIsImageClicked(() => false)}>
                <div className="profile-picture-clicked-container">
                    <img src={barData.profilePictureURL}
                        alt="user profile" />
                </div>
            </div>}
    </div>
}

function UserSection(props) {

    return (
        <div className="user-section">
            <span>{props.username}</span>
            <div className="profile-picture-container">
                <img src={props.profilePictureUrl}
                    alt="user profile"
                    onClick={() => props.setIsImageClicked(() => true)}></img>
            </div>
        </div>
    );
}

export default Bar;