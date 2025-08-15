function dashboardSkeletonBuilder() {
    const dashboard = {
        weeklyReport: { expenses: 0, savings: 0 },
        upcomingTransactions: [],
        notifications: [],
        emergencyFund: null,
        achievementMask: 0
    }
    return dashboard;
}

export default dashboardSkeletonBuilder;