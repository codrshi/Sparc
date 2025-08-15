const config = {
    node_env: {
        DEVELOPMENT: "development",
        PRODUCTION: "production"
    },
    INFINITY_AMOUNT: 'infinity',
    RESET: "Reset",
    uploadPath: "uploads/",
    tempUploadPath: "uploads/temp/",
    DEFAULT_PROFILE_PICTURE_PATH: "uploads/default/default_profile_picture.png",
    scheduler: {
        MAX_CONCURRENT_JOBS: 3,
        MAX_CONCURRENT_WORKERS_PER_USER: 5
    },
    hashingRounds: {
        MIN_VALUE: 1000,
        MAX_VALUE: 5000,
    },
    mathOperation: {
        ADD: "+",
        SUBTRACT: "-",
    },
    endpoints: {
        TRANSACTION: "/transaction",
        manageExpenses: {
            EMERGENCY_FUND: "/emergency-fund",
            EXPENSE_LIMIT: "/expense-limit",
            MONTHLY_EXPENSE_AGGREGATE: "/monthly-expense-aggregate",
            RECURRING_TRANSACTION: "/recurring-transaction",
        },
        MONTHLY_SUMMARY: "/monthly-summary",
        DASHBOARD: "/dashboard",
        login: {
            LOGIN: "/login",
            IS_USER_PRESENT: "/login/isUserPresent",
            VERIFICATION_CODE: "/login/verification-code",
            REFRESH_TOKEN: "/login/refresh-token",
            AUTH: "/login/auth",
            VERIFY_EMAIL: "/login/verify-email",
            CHANGE_PASSWORD: "/login/change-password"
        },
        settings: {
            CREDENTIAL: "/settings/credential",
            LOGOUT: "/settings/logout",
            DELETE_ACCOUNT: "/settings/delete-account",
        },
        BAR: "/bar",
        ACHIEVEMENT: "/achievement",
        financialAdvisor: {
            ADVICE: "/financial-advisor/advice",
            CREDITS: "/financial-advisor/credits",
        }
    },
    alertSeverity: {
        SUCCESS: "success",
        INFO: "info",
        WARNING: "warning",
        ERROR: "error"
    },
    monthNames: ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    expenseLimit: {
        expenseLimitsLabel: {
            "Total": "total monthly expense limit",
            "Rent": "monthly expense limit for rent",
            "Tax": "monthly expense limit for tax(es)",
            "Insurance": "monthly expense limit for insurance(s)",
            "Investment": "monthly expense limit for investment(s)",
            "Electricity": "monthly expense limit for electricity consumption",
            "Water": "monthly expense limit for water consumption",
            "Gas": "monthly expense limit for gas consumption",
            "Bill": "monthly expense limit for bills",
            "Grocery": "monthly expense limit for grocery",
            "Restaurant": "monthly expense limit for restaurent spendings",
            "Entertainment": "monthly expense limit for entertainment",
            "Shopping": "monthly expense limit for shopping",
            "Travel": "monthly expense limit for travelling",
            "Houseware": "monthly expense limit for houseware purchases",
            "Service": "monthly expense limit for services",
            "Miscellaneous": "monthly expense limit for miscellaneous spendings",
            "Income": "monthly expense limit for income"
        },
        EXPENSE_LIMIT_WARN_FRACTION: 0.8,
        TOTAL_EXPENSE_LIMIT: 'Total',
        EXPENSE_LIMIT_APPROACHING: "approaching",
        EXPENSE_LIMIT_EXCEEDING: "exceeding",
        EXPENSE_LIMIT_IN_CHECK: "in check"
    },
    panelNames: {
        DASHBOARD: "dashboard",
        MY_TRANSACTIONS: "my-transactions",
        MONTHLY_SUMMARY: "monthly-summary",
        MANAGE_EXPENSES: "manage-expenses",
        SETTINGS: "settings"
    },
    monthSelectorAction: {
        INCREMENT: "Increment",
        DECREMENT: "Decrement"
    },
    DESCRIPTION_CHARACTERS_LIMIT: 150,
    transaction: {
        ID: "ID",
        TYPE: "Type",
        DATE: "Date",
        DESCRIPTION: "Description",
        PAYMENT: "Payment",
        AMOUNT: "Amount",
        amountType: {
            DEBIT: "Debit",
            CREDIT: "Credit"
        }
    },
    paymentMethods: {
        CASH: "Cash",
        CARD: "Card",
        ONLINE: "Online"
    },
    transactionTypes: {
        INCOME: "Income",
        RENT: "Rent",
        TAX: "Tax",
        INSURANCE: "Insurance",
        INVESTMENT: "Investment",
        ELECTRICITY: "Electricity",
        WATER: "Water",
        GAS: "Gas",
        BILL: "Bill",
        GROCERY: "Grocery",
        RESTAURANT: "Restaurant",
        ENTERTAINMENT: "Entertainment",
        SHOPPING: "Shopping",
        TRAVEL: "Travel",
        HOUSEWARE: "Houseware",
        SERVICE: "Service",
        MISCELLANEOUS: "Miscellaneous",
    },
    achievements: {
        achievementList: [
            {
                TITLE: "first_step",
                CRITERIA: "add your first transaction"
            },
            {
                TITLE: "recurring_rockstar",
                CRITERIA: "add atleast 3 recurring transactions"
            },
            {
                TITLE: "thrift_saver",
                CRITERIA: "save atleast 20% of income in savings for a month"
            },
            {
                TITLE: "expense_tracker",
                CRITERIA: "download expense report for a past month"
            },
            {
                TITLE: "budget_guru",
                CRITERIA: "stay within your expense limit for a month"
            },
            {
                TITLE: "emergency_planner",
                CRITERIA: "enable emergency fund and allocate some percentage of savings to it"
            },
            {
                TITLE: "halfway_there",
                CRITERIA: "reach 50% of your emergency fund target"
            },
            {
                TITLE: "fund_raiser",
                CRITERIA: "reach 100% of your emergency fund target"
            },
            {
                TITLE: "master_achiever",
                CRITERIA: "unlock all other achievements"
            }
        ],
        id: {
            FIRST_STEP: 0,
            RECURRING_ROCKSTAR: 1,
            THRIFT_SAVER: 2,
            EXPENSE_TRACKER: 3,
            BUDGET_GURU: 4,
            EMERGENCY_PLANNER: 5,
            HALFWAY_THERE: 6,
            FUND_RAISER: 7,
            MASTER_ACHIEVER: 8
        }
    },
    db: {
        expenseLimitMonth: null,
        PER_PAGE_LIMIT: 10,
        NO_CONDITION: "",
        isQueryExecuting: {
            expenseLimit: false,
            recurringTransaction: false,
            transaction: false,
            emergencyFund: false,
            monthlyExpenseAggregate: false,
            dashboard: false,
            login: false,
            settings: false
        },
        monthlyExpenseAggregate: {
            TRANSACTION_REMOVED: "transaction removed",
            TRANSACTION_ADDED: "transaction added",
            ADD_SIGN: '+',
            SUBTRACT_SIGN: '-'
        },
        emergencyFund: {
            DEFAULT_PERCENTAGE_VALUE: 10
        },
        tables: {
            transaction: {
                TABLE_NAME: "transaction",
                attributes: {
                    TRANSACTION_TYPE: "transaction_type",
                    TRANSACTION_DATE: "transaction_date",
                    TRANSACTION_DESCRIPTION: "transaction_description",
                    PAYMENT_METHOD: "payment_method",
                    TRANSACTION_AMOUNT: "transaction_amount",
                    TRANSACTION_ID: "transaction_id"
                },
                foreignKey: {
                    CREDENTIAL_ID: "credential_id"
                }
            },
            recurringTransaction: {
                TABLE_NAME: "recurring_transaction",
                attributes: {
                    TRANSACTION_TYPE: "transaction_type",
                    TRANSACTION_DATE: "transaction_date",
                    TRANSACTION_DESCRIPTION: "transaction_description",
                    PAYMENT_METHOD: "payment_method",
                    TRANSACTION_AMOUNT: "transaction_amount",
                    TRANSACTION_ID: "transaction_id"
                },
                foreignKey: {
                    CREDENTIAL_ID: "credential_id"
                }
            },
            expenseLimit: {
                TABLE_NAME: "expense_limit",
                attributes: {
                    CREATION_MONTH: "creation_month",
                    TRANSACTION_TYPE: "transaction_type",
                    IS_ENABLED: "is_enabled",
                    TRANSACTION_AMOUNT_LIMIT: "transaction_amount_limit",
                },
                foreignKey: {
                    CREDENTIAL_ID: "credential_id"
                }
            },
            monthlyExpenseAggregate: {
                TABLE_NAME: "monthly_expense_aggregate",
                attributes: {
                    TRANSACTION_TYPE: "transaction_type",
                    MONTH: "transaction_month",
                    MONTHLY_AMOUNT: "monthly_amount"
                },
                foreignKey: {
                    CREDENTIAL_ID: "credential_id"
                }
            },
            emergencyFund: {
                TABLE_NAME: "emergency_fund",
                attributes: {
                    IS_ENABLED: "is_enabled",
                    AMOUNT: "amount",
                    TARGET_AMOUNT: "target_amount",
                    DEFAULT_TARGET_AMOUNT: "default_target_amount",
                    PERCENTAGE_VALUE: "percentage_value",
                    DEFAULT_PERCENTAGE_VALUE: "default_percentage_value",
                    PAST_MONTH_COUNT: "past_month_count"
                },
                foreignKey: {
                    CREDENTIAL_ID: "credential_id"
                }
            },
            achievement: {
                TABLE_NAME: "achievement",
                attributes: {
                    UNLOCK_MASK: "unlock_mask"
                },
                foreignKey: {
                    CREDENTIAL_ID: "credential_id"
                }
            },
            credential: {
                TABLE_NAME: "credential",
                attributes: {
                    ID: "id",
                    USERNAME: "username",
                    EMAIL: "email",
                    PASSWORD_WITH_SALT: "password_with_salt",
                    HASHING_ROUNDS: "hashing_rounds",
                    CREATED_AT: "created_at",
                    IS_TIP_ENABLED: "is_tip_enabled",
                    IS_EXPORT_REPORT_ENABLED: "is_export_report_enabled",
                    PROFILE_PICTURE_PATH: "profile_picture_path",
                    CREDITS_LEFT: "credits_left"
                }
            },
        },

    },
    notificationType: {
        tip: {
            TITLE: "[TIP]",
            COLOR: "blue"
        },
        important: {
            TITLE: "[IMP]",
            COLOR: "red"
        },
        warn: {
            TITLE: "[WARN]",
            COLOR: "olive"
        }
    },
    userInterface: {
        color: {
            doughnutChartColorPalette: {
                savings: [["#4CAF50", "#FF9999", "#90CAF9"], ["#A8D5BA", "#FF4D4D", "#90CAF9"], ["#A8D5BA", "#FF9999", "#2196F3"]],
                deficit: [["#4CAF50", "#FF9999", "#FFD3A6"], ["#A8D5BA", "#FF4D4D", "#FFD3A6"], ["#A8D5BA", "#FF9999", "#FF8C42"]],
            },
            pieChartColorPalette: ["#4285F4", "#D9308F", "#673AB7", "#00ACC1", "#7CB342",
                "#F57C00",
                "#00BCD4",
                "#FFEB3B",
                "#E53935",
                "#1E88E5",
                "#8BC34A",
                "#F06292",
                "#FFB300",
                "#009688",
                "#9C27B0",
                "#757575",
                "#B3E5FC"
            ]
        },
        transactionTableUiFields: {
            myTransactionsPanel: {
                isRecurringTransaction: false,
                HEADER: "Your transactions",
                operationType: {
                    ADD: "Add transaction",
                    EDIT: "Edit transaction",
                    DELETE: "Delete transaction"
                },
                endpoints: {
                    GET_ALL_TRANSACTION: "transaction",
                    UPDATE_TRANSACTION: "transaction",
                    ADD_TRANSACTION: "transaction",
                    DELETE_TRANSACTION: "transaction"
                }
            },
            manageExpensesPanel: {
                isRecurringTransaction: true,
                HEADER: "Your recurring transactions",
                operationType: {
                    ADD: "Add recurring transaction",
                    EDIT: "Edit recurring transaction",
                    DELETE: "Delete recurring transaction"
                },
                endpoints: {
                    GET_ALL_TRANSACTION: "recurring-transaction",
                    UPDATE_TRANSACTION: "recurring-transaction",
                    ADD_TRANSACTION: "recurring-transaction",
                    DELETE_TRANSACTION: "recurring-transaction"
                }
            }
        },
        dashboardNotification: {
            EXPENSE_LIMIT_MESSAGE: "Please set expense limits to manage your budget and optimize savings.",
            CREDITS_LEFT_MESSAGE: "You have exhausted your credits to use AI advisor. Please wait for next month for credits to replenish."
        }
    },
    MAX_CREDITS: 3,
    loggingLevel: {
        INFO: "INFO",
        DEBUG: "DEBUG",
        WARN: "WARN",
        ERROR: "ERROR"
    },
    errorCode: {
        1001: `An error occured while rendering {0} page : {1}`,
        1002: `Field {0} is missing. Please try again.`,
        1003: `Field {0} is invalid. Please try again.`,
        1004: `Session expired. Please login again.`,
        1005: `The requested resource is not present in the database.`,
    },
    parameters: {
        USER_ID: "userId",
        START_DATE: "startDate",
        END_DATE: "endDate",
        OFFSET: "offset",
        LIMIT: "limit",
        MONTH: "month",
        ACCESS_TOKEN: "accessToken",
        REFRESH_TOKEN: "refreshToken",
        EXPENSE_LIMIT_TYPE: "expenseLimit[{0}].type",
        EXPENSE_LIMIT_IS_ENABLED: "expenseLimit[{0}].isEnabled",
        EXPENSE_LIMIT_AMOUNT_LIMIT: "expenseLimit[{0}].amountLimit",
        EMERGENCY_FUND_IS_ENABLED: "emergencyFund.isEnabled",
        EMERGENCY_FUND_TARGET_AMOUNT: "emergencyFund.targetAmount",
        EMERGENCY_FUND_AMOUNT: "emergencyFund.amount",
        EMERGENCY_FUND_PAST_MONTH_COUNT: "emergencyFund.pastMonthCount",
        EMERGENCY_FUND_PERCENTAGE_VALUE: "emergencyFund.percentageValue",
        EMERGENCY_FUND_DEFAULT_TARGET_AMOUNT: "emergencyFund.defaultTargetAmount",
        TRANSACTION_TYPE: "transaction.type",
        TRANSACTION_DATE: "transaction.date",
        TRANSACTION_DESCRIPTION: "transaction.description",
        TRANSACTION_PAYMENT_METHOD: "transaction.paymentMethod",
        TRANSACTION_AMOUNT: "transaction.amount",
        TRANSACTION_ID: "transaction.id",
        CREDENTIAL_IS_TIP_ENABLED: "credential.isTipEnabled",
        CREDENTIAL_IS_EXPORT_REPORT_ENABLED: "credential.isExportReportEnabled",

    }
}

export default config;