import React, { useEffect, useState } from "react";
import "./style/Dashboard.css";
import config from "../../configuration/config.js";
import { TransactionTypeIcon } from "../myTransactionSectionComponent/TransactionForm/TransactionFormBody";
import { Dialog, DialogContent, DialogContentText, DialogTitle, Slide, Tooltip } from "@mui/material";
import axios from "axios";
import countSetBits from "../../utility/setBitCounter.js";

const achievementList = config.achievements.achievementList;

function Dashboard(props) {

    const [dashboard, setDashboard] = useState({
        weeklyReport: { expenses: 0, savings: 0 },
        upcomingTransactions: [],
        notifications: null,
        emergencyFund: null,
        achievementMask: 0
    });
    const [notificationIndex, setNotificationIndex] = useState(0);
    const [isAchievementSectionClicked, setIsAchievementSectionClicked] = useState(false);

    useEffect(() => {
        if (config.db.isQueryExecuting.transaction)
            return;

        config.db.isQueryExecuting.dashboard = true;

        axios.get(`${config.endpoints.DASHBOARD}`)
            .then((response) => {
                console.log(response.data);
                setDashboard(() => response.data);
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error)
                    props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                else
                    props.setAlertLabel(() => ({ text: "Failed to fetch dashboard content.", severity: config.alertSeverity.ERROR }));
            })
            .finally(() => { config.db.isQueryExecuting.dashboard = false; });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNotificationIndex(() => (notificationIndex + 1) % dashboard.notifications.length);
        }, 5000);
        return () => clearInterval(intervalId);
    }, [notificationIndex, dashboard.notifications]);

    return (<>
        <div className="board-header">
            <span>Dashboard</span>
        </div>
        <div id="dashboard-body" className="board-body">
            <div id="weekly-expense-component" className="dashboard-body-component">
                <span>Weekly Report</span>
                <div className="weekly-expense-component-content">
                    <div>
                        <span style={{ color: "var(--bg-color-2)", transition: "all 0.3s ease" }}>This week expenses</span>
                        <span style={{ color: "red" }}>{"Rs." + dashboard.weeklyReport.expenses}</span>
                    </div>
                    <div>
                        <span style={{ color: "var(--bg-color-2)", transition: "all 0.3s ease" }}>This week savings</span>
                        <span style={{ color: "green" }}>{"Rs." + dashboard.weeklyReport.savings}</span>
                    </div>
                </div>
            </div>
            <div className="dashboard-body-component">
                <span>Notifications</span>
                {dashboard.notifications !== null && <Notification notification={dashboard.notifications[notificationIndex]}></Notification>}
            </div>
            <div className="dashboard-body-component" >
                <span>Upcoming transactions</span>
                <UpcomingTransactions upcomingTransactions={dashboard.upcomingTransactions}></UpcomingTransactions>
            </div>
            <div className="dashboard-body-component" >
                <span>Emergency Fund</span>
                <EmergencyFund emergencyFund={dashboard.emergencyFund}></EmergencyFund>
            </div>
            <div className="dashboard-body-component" >
                <span>Achievements</span>
                <Achievement achievementMask={dashboard.achievementMask} setIsAchievementSectionClicked={setIsAchievementSectionClicked}></Achievement>
            </div>
        </div>
        <React.Fragment>
            <Dialog
                open={isAchievementSectionClicked}
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
                onClose={() => setIsAchievementSectionClicked(false)}
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
                    {`Achievements (${countSetBits(dashboard.achievementMask)}/9)`}
                </DialogTitle>
                <DialogContent sx={{ margin: "0 1rem 1rem 1rem", padding: 0 }}>
                    <DialogContentText sx={{ whiteSpace: 'pre-line' }} className="alert-dialog-description">
                        <div className="achievement-dialog-body">
                            {Object.entries(config.achievements.id).map((achievement, id) =>
                                <Tooltip title={
                                    <div>
                                        <strong>{achievementList[id].TITLE.replace(/_/g, ' ')}</strong> <br />
                                        {achievementList[id].CRITERIA}
                                    </div>
                                }
                                    key={achievementList[id].TITLE}>
                                    <div className="achievement-body-item"
                                        style={{ opacity: ((dashboard.achievementMask >> id) & 1) === 1 ? 1 : 0.5 }} >
                                        <img src={require(`../../asset/achievement/${achievementList[id].TITLE}.png`)} alt={achievementList[id].TITLE} />
                                        <span>{achievementList[id].TITLE.replace(/_/g, ' ')}</span>
                                    </div>
                                </Tooltip>
                            )}
                        </div>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    </>);
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function UpcomingTransactions(props) {

    return (
        <div style={{ width: "85%", marginTop: "1rem" }} className="upcoming-transaction">
            <div >
                {props.upcomingTransactions.map((transaction, index) => {
                    return (
                        <div key={index} className="upcoming-transaction-item">
                            <TransactionTypeIcon type={transaction.type} color="#d592f4"></TransactionTypeIcon>
                            <div className="upcoming-transaction-item-text">
                                <span>{`Rs. ${Math.abs(parseFloat(transaction.amount))} on ${transaction.date.split("-")[2]}, ${config.monthNames[new Date().getMonth()]}`}</span>
                                <span>{transaction.description !== "" ? transaction.description : "(no description)"}</span>
                            </div>
                        </div>
                    );
                }
                )}
            </div>
        </div>
    );
}

function Notification(props) {

    return <div className="notification-body">
        <span style={{ color: "var(--bg-color-2)", transition: "all 0.3s ease" }}>
            <span style={{ color: props.notification.type.COLOR }}>{props.notification.type.TITLE} </span>
            {props.notification.message}
        </span>
    </div>
}

function EmergencyFund(props) {
    if (props.emergencyFund === null)
        return;

    return <div className="emergency-fund-body">
        {props.emergencyFund.isEnabled &&
            <div>
                <span>{`Rs.${props.emergencyFund.amount} / Rs.${props.emergencyFund.targetAmount}`}</span>
                <div className="meter-container" style={{ width: `${100 / 3}rem` }}><div className="meter-fill" style={{ width: `${parseFloat(props.emergencyFund.delta) / 3}rem` }}></div></div>
            </div>}
        {!props.emergencyFund.isEnabled && <span><span style={{ color: config.notificationType.important.COLOR }}>{config.notificationType.important.TITLE} </span>Enable Emergency Fund in Manage Expenses section to cover unexpected expenses.</span>}
    </div>
}

function Achievement(props) {

    return (<div className="achievement-body-mask"><div className="achievement-body" onClick={() => props.setIsAchievementSectionClicked(true)}>
        {Object.entries(config.achievements.id).map((achievement, id) =>
            <div className="achievement-body-item"
                style={{ opacity: ((props.achievementMask >> id) & 1) === 1 ? 1 : 0.5 }}
                key={achievementList[id].TITLE}>
                <img src={require(`../../asset/achievement/${achievementList[id].TITLE}.png`)} alt={achievementList[id].TITLE} />
                <span>{achievementList[id].TITLE.replace(/_/g, ' ')}</span>
            </div>
        )}
    </div></div>);
}

export default Dashboard;