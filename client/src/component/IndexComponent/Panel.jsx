import React, { useContext } from "react";
import { SectionContext } from "./App.jsx";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TuneIcon from '@mui/icons-material/Tune';
import SettingsIcon from '@mui/icons-material/Settings';
import "./style/Panel.css";
import { Tooltip } from "@mui/material";
import config from "../../configuration/config.js";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const leftPanelSections = [
    {
        className: config.panelNames.DASHBOARD,
        title: "Dashboard",
        sectionName: <DashboardIcon>
        </DashboardIcon>
    },
    {
        className: config.panelNames.MY_TRANSACTIONS,
        title: "My transactions",
        sectionName: <ReceiptLongIcon></ReceiptLongIcon>
    },
    {
        className: config.panelNames.MONTHLY_SUMMARY,
        title: "Monthly summary",
        sectionName: <SummarizeIcon></SummarizeIcon>
    },
    {
        className: config.panelNames.MANAGE_EXPENSES,
        title: "Manage Expenses",
        sectionName: <TuneIcon></TuneIcon>
    },
    {
        className: config.panelNames.SETTINGS,
        title: "Settings",
        sectionName: <SettingsIcon></SettingsIcon>
    },
    {
        className: config.panelNames.FINANCIAL_ADVISOR,
        title: "Financial Advisor AI",
        sectionName: <AutoAwesomeIcon></AutoAwesomeIcon>
    }
];

function Panel(props) {

    const { section, setSection } = useContext(SectionContext);

    function handleClick(clickedSection) {
        setSection(clickedSection);
    }

    return (
        <div className="panel">
            {leftPanelSections.map(leftPanelSection => {
                return (<div style={{ cursor: "pointer" }}
                    className={[leftPanelSection.className, section === leftPanelSection.className ? "clickedPanel" : ""].join(' ')}
                    onClick={() => { handleClick(leftPanelSection.className) }}
                    key={leftPanelSection.className}>
                    <Tooltip title={leftPanelSection.title}>
                        {leftPanelSection.sectionName}
                    </Tooltip>
                </div>);
            })}
        </div>
    );

}

export default Panel;