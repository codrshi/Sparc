import React, { useState, useEffect, useReducer, useRef } from "react";
import "./style/MyTransactions.css";
import axios from "axios";
import TransactionTable from "./TransactionTable/TransactionTable.jsx";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TransactionForm from "./TransactionForm/TransactionForm.jsx";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Slide } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';
import config from "../../configuration/config.js";
import getQueryBuilder from "../../utility/builder/getQueryBuilder.js";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

function MyTransactions(props) {

    const [transactions, setTransactions] = useState([]);
    const isQueryExecuting = useRef(false);
    const [tablePage, setTablePage] = useState(0);
    const hasMoreRows = useRef(true);
    const [showForm, showFormDispatch] = useReducer(showFormReducer, null);
    const boardHeaderRef = useRef(null);
    // eslint-disable-next-line no-unused-vars
    const [transactionTableHeight, setTransactionTableHeight] = useState(0);
    const [expenseLimitDialogText, setExpenseLimitDialogText] = useState(null);

    let [queryParameter, setQueryParameter] = useState({
        [config.transaction.DATE]: null,
        [config.transaction.AMOUNT]: null,
        [config.transaction.PAYMENT]: null,
        [config.transaction.TYPE]: null
    });

    // useEffect(() => {
    //     if(boardHeaderRef.current!=null){
    //         setTransactionTableHeight(props.boardHeight - boardHeaderRef.current.offsetHeight);
    //     }
    // },[props.boardHeight]);

    useEffect(() => {
        if (isQueryExecuting.current || !hasMoreRows.current)
            return;
        isQueryExecuting.current = true;
        axios.get(`/${props.currentPanel.endpoints.GET_ALL_TRANSACTION}`, {
            params: {
                condition: getQueryBuilder(queryParameter),
                offset: tablePage * config.db.PER_PAGE_LIMIT,
                limit: config.db.PER_PAGE_LIMIT
            }
        })
            .then((response) => {
                if (response.data.length > 0)
                    setTransactions((prev) => [...prev, ...response.data]);
                else
                    hasMoreRows.current = false;
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.error)
                    props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                else
                    props.setAlertLabel(() => ({ text: "Failed to fetch transactions.", severity: config.alertSeverity.ERROR }));
            })
            .finally(() => { isQueryExecuting.current = false; });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryParameter, tablePage]);

    function handleAttributeClick({ attribute, action }) {
        setQueryParameter((previousState) => ({
            ...previousState,
            [attribute]: action
        }));
        setTablePage(0);
        setTransactions([]);
        hasMoreRows.current = true;
    }

    function showFormReducer(state, action) {
        switch (action.type) {
            case "Close": return null;
            case props.currentPanel.operationType.ADD: return {
                transaction: null,
                formHeading: props.currentPanel.operationType.ADD,
                submitButtonName: "Add"
            }
            case props.currentPanel.operationType.EDIT: return {
                transaction: action.transaction,
                formHeading: props.currentPanel.operationType.EDIT,
                submitButtonName: "Confirm"
            }
            case props.currentPanel.operationType.DELETE: return {
                transaction: action.transaction,
                formHeading: props.currentPanel.operationType.DELETE,
                submitButtonName: "Confirm"
            }
            default: return state;
        }
    }

    function handleClose() {
        showFormDispatch({
            type: "Close"
        });
    }

    function addTransaction() {
        props.setAlertLabel(null);
        showFormDispatch({
            type: props.currentPanel.operationType.ADD
        });
    }

    function editTransaction(transactionToEdit) {
        showFormDispatch({
            type: props.currentPanel.operationType.EDIT,
            transaction: transactionToEdit
        });
    }

    function deleteTransaction(transactionToDelete) {
        showFormDispatch({
            type: props.currentPanel.operationType.DELETE,
            transaction: transactionToDelete
        });
    }

    function handleSubmit(newTransaction, oldTransaction, operationType) {

        if (isQueryExecuting.current)
            return;

        isQueryExecuting.current = true;
        if (operationType === props.currentPanel.operationType.EDIT) {
            axios
                .put(`/${props.currentPanel.endpoints.UPDATE_TRANSACTION}`, newTransaction, {
                    params: { transactionId: oldTransaction.id }
                })
                .then((response) => {
                    const updatedTransaction = response.data;
                    console.log('Transaction updated successfully:', JSON.stringify(updatedTransaction));
                    setTransactions(transactions => transactions.map(transaction => transaction.id === updatedTransaction.id ? updatedTransaction : transaction));
                    props.setAlertLabel(() => (
                        { text: "Transaction updated successfully.", severity: config.alertSeverity.SUCCESS }
                    ));

                    if (!props.currentPanel.isRecurringTransaction) {
                        return axios.post(`${config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE}`, {
                            oldTransaction: oldTransaction,
                            newTransaction: newTransaction
                        });
                    }
                    return Promise.resolve(null);
                })
                .then((response) => {
                    if (response !== null && response.data !== null)
                        setExpenseLimitDialogText(response.data);
                })
                .catch((error) => {
                    if (error.response && error.response.data && error.response.data.error)
                        props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                    else
                        props.setAlertLabel(() => ({ text: "Failed to update transaction.", severity: config.alertSeverity.ERROR }));
                })
                .finally(() => { isQueryExecuting.current = false; });
        }
        else if (operationType === props.currentPanel.operationType.ADD) {
            axios
                .post(`/${props.currentPanel.endpoints.ADD_TRANSACTION}`, newTransaction)
                .then((response) => {
                    const addedTransaction = response.data;
                    console.log("Transaction added successfully:", JSON.stringify(addedTransaction));
                    setTransactions(transactions => [
                        ...transactions,
                        addedTransaction
                    ]);
                    props.setAlertLabel(() => (
                        { text: "Transaction added successfully.", severity: config.alertSeverity.SUCCESS }));

                    if (!props.currentPanel.isRecurringTransaction) {
                        return axios.post(`${config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE}`, {
                            oldTransaction: null,
                            newTransaction: newTransaction
                        });
                    }
                    return Promise.resolve(null);
                })
                .then((response) => {
                    if (response !== null && response.data !== null)
                        setExpenseLimitDialogText(response.data);
                })
                .catch((error) => {
                    if (error.response && error.response.data && error.response.data.error)
                        props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                    else
                        props.setAlertLabel(() => ({ text: "Failed to add transaction.", severity: config.alertSeverity.ERROR }));
                })
                .finally(() => { isQueryExecuting.current = false; });
        }
        else {
            axios.delete(`/${props.currentPanel.endpoints.DELETE_TRANSACTION}`, {
                params: {
                    transactionId: oldTransaction.id
                }
            })
                .then((response) => {
                    const deletedTransaction = response.data;
                    console.log("Transaction deleted successfully:", JSON.stringify(deletedTransaction));
                    setTransactions((transactions) => transactions.filter(transaction => transaction.id !== deletedTransaction.id))
                    props.setAlertLabel(() => (
                        { text: "Transaction deleted successfully.", severity: config.alertSeverity.SUCCESS }));

                    if (!props.currentPanel.isRecurringTransaction) {
                        return axios.post(`${config.endpoints.manageExpenses.MONTHLY_EXPENSE_AGGREGATE}`, {
                            oldTransaction: oldTransaction,
                            newTransaction: null
                        });
                    }
                    return Promise.resolve(null);
                })
                .then((response) => {
                    if (response !== null && response.data !== null)
                        setExpenseLimitDialogText(response.data);
                })
                .catch((error) => {
                    if (error.response && error.response.data && error.response.data.error)
                        props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
                    else
                        props.setAlertLabel(() => ({ text: "Failed to delete transaction.", severity: config.alertSeverity.ERROR }));
                })
                .finally(() => { isQueryExecuting.current = false; });
        }
    }

    return (<>
        <div className="board-header" ref={boardHeaderRef}>
            <span>{props.currentPanel.HEADER}</span>
            <Tooltip title={"Add new transaction"}>
                <IconButton className="add-transaction-button" onClick={addTransaction}>
                    <AddCircleIcon sx={{ width: "100%", height: "100%" }} />
                </IconButton>
            </Tooltip>
        </div>
        <div className="board-body" >
            {//style={{height: transactionTableHeight}}
            }
            <TransactionTable
                transactions={transactions}
                tableHeight={transactionTableHeight}
                queryParameter={queryParameter}
                setTablePage={setTablePage}
                onAttributeClick={handleAttributeClick}
                onEditClick={editTransaction}
                onDeleteClick={deleteTransaction}>
            </TransactionTable>
        </div>
        {showForm != null && <TransactionForm
            operationType={props.currentPanel.operationType}
            showForm={showForm}
            defaultAmountType={showForm.transaction !== null && showForm.transaction.amount > 0 ? config.transaction.amountType.CREDIT : config.transaction.amountType.DEBIT}
            onClose={handleClose}
            onSubmit={handleSubmit}>
        </TransactionForm>}
        <React.Fragment>
            <Dialog
                open={expenseLimitDialogText !== null}
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
                onClose={() => setExpenseLimitDialogText(null)}
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
                    <WarningAmberIcon sx={{ color: "#e4d100" }}></WarningAmberIcon>
                    {"Warning"}</DialogTitle>
                <DialogContent sx={{ margin: "0 1rem 1rem 1rem", padding: 0 }}>
                    <DialogContentText sx={{ whiteSpace: 'pre-line' }} className="alert-dialog-description">
                        {expenseLimitDialogText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: 0, margin: "0 1rem 1rem 0" }}>
                    <Button id="close-button"
                        onClick={() => setExpenseLimitDialogText(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    </>);
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default MyTransactions;