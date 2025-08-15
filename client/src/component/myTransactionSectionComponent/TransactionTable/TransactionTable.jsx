import React, { useEffect, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button,
    Tooltip
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import "../style/TransactionTable.css";
import emptyStateImage from "../../../asset/no_transaction_empty_state.png";
import config from '../../../configuration/config.js';
import TransactionTableHeaderCell from "./TransactionTableHeaderCell.jsx";


const tableHeaders = [config.transaction.ID, config.transaction.TYPE, config.transaction.DATE, config.transaction.DESCRIPTION, config.transaction.PAYMENT, config.transaction.AMOUNT, "Action"];

function TransactionTable(props) {

    let descriptionCellRefs = useRef([]);
    let descriptionHeaderRef = useRef(null);

    useEffect(() => {
        if (descriptionCellRefs.current.length === 0)
            return;

        descriptionCellRefs.current.forEach((descriptionCellRef) => {
            if (descriptionCellRef) {
                const scrollableWidth = descriptionCellRef.clientWidth - descriptionHeaderRef.current.clientWidth;
                const scrollSpeed = 30;

                descriptionCellRef.style.transition = scrollableWidth > 0
                    ? `transform ${scrollableWidth / scrollSpeed}s linear`
                    : `transform 10000000s linear`;
            }
        });
    }, [props.transactions]);

    function handleScroll(event) {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        if (scrollHeight - Math.ceil(scrollTop) === clientHeight) {

            props.setTablePage(tablePage => tablePage + 1);
        }
    }

    return (
        <>
            <TableContainer
                className="transaction-table"
                onScroll={(event) => handleScroll(event)}
            //style = {{height: props.transactions.length!==0 ?`${props.tableHeight}px`:'auto'}} 
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            {tableHeaders.map(tableHeader => {
                                return (<TransactionTableHeaderCell
                                    key={tableHeader}
                                    descriptionHeaderRef={descriptionHeaderRef}
                                    tableHeader={tableHeader}
                                    queryParameter={props.queryParameter}
                                    onAttributeClick={props.onAttributeClick}>
                                </TransactionTableHeaderCell>);
                            })}
                        </TableRow>
                    </TableHead>
                    {props.transactions.length !== 0 && <TableBody >
                        {props.transactions.map((transaction) => {
                            return (
                                <TableRow
                                    className="table-body-row"
                                    key={transaction.id} >
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.type}</TableCell>
                                    <TableCell>{transaction.date}</TableCell>
                                    <TableCell
                                        className="description-cell">
                                        <span
                                            ref={descriptionCellRef => { descriptionCellRefs.current.push(descriptionCellRef) }}>
                                            {transaction.description}
                                        </span>
                                    </TableCell>
                                    <TableCell>{transaction.paymentMethod}</TableCell>
                                    <TableCell className={transaction.amount > 0 ? "transaction-amount-cell-positive" : "transaction-amount-cell-negative"}>
                                        {"₹" + Math.abs(transaction.amount)}</TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit transaction">
                                            <Button
                                                className="transaction-table-button"
                                                variant="outlined"
                                                onClick={() => { props.onEditClick(transaction) }}>
                                                <EditOutlinedIcon />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip title="Delete transaction">
                                            <Button style={{ marginLeft: '1rem' }}
                                                className="transaction-table-button"
                                                variant="outlined"
                                                onClick={() => { props.onDeleteClick(transaction) }}>
                                                <DeleteOutlinedIcon />
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>);
                        })}
                    </TableBody>}
                </Table>
            </TableContainer>
            {props.transactions.length === 0 && <EmptyTransactionState></EmptyTransactionState>}
        </>
    );
}



function EmptyTransactionState() {
    return (
        <div className='empty-state-body'>
            <img src={emptyStateImage} alt=''></img>
            <span>No transactions found</span>
            <span>Click on the top-right add icon to create a new transaction.</span>
        </div>);
}

export default TransactionTable;