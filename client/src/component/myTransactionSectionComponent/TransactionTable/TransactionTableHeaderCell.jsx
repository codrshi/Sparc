import { Menu, MenuItem, TableCell } from "@mui/material";
import config from "../../../configuration/config";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState } from "react";
import "../style/TransactionTable.css";

function TransactionTableHeaderCell(props) {
  return (<TableCell
    id={props.tableHeader}
    className="table-header-cell"
    ref={props.tableHeader === config.transaction.DESCRIPTION ? props.descriptionHeaderRef : null}>
    <div className='table-header-cell-content'>
      <span>{props.tableHeader}</span>
      {[config.transaction.DATE, config.transaction.AMOUNT].includes(props.tableHeader) && <KeyboardArrowUpIcon
        sx={{
          cursor: 'pointer',
          color: props.queryParameter[props.tableHeader] === "DESC" ? '#d592f4' : '#6237a0'
        }}
        onClick={() => props.onAttributeClick({
          attribute: props.tableHeader,
          action: props.queryParameter[props.tableHeader] === "DESC" ? null : "DESC"
        })}></KeyboardArrowUpIcon>}
      {[config.transaction.DATE, config.transaction.AMOUNT].includes(props.tableHeader) && <KeyboardArrowDownIcon
        sx={{
          cursor: 'pointer',
          color: props.queryParameter[props.tableHeader] === "ASC" ? '#d592f4' : '#6237a0'
        }}
        onClick={() => props.onAttributeClick({
          attribute: props.tableHeader,
          action: props.queryParameter[props.tableHeader] === "ASC" ? null : "ASC"
        })}></KeyboardArrowDownIcon>}
      {[config.transaction.PAYMENT, config.transaction.TYPE].includes(props.tableHeader) && <AttributeDropdownIcon
        tableHeader={props.tableHeader}
        queryParameter={props.queryParameter}
        onAttributeClick={props.onAttributeClick}
      ></AttributeDropdownIcon>}
    </div>
  </TableCell>);
}

function AttributeDropdownIcon(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const items = props.tableHeader === config.transaction.TYPE ? Object.values(config.transactionTypes) : Object.values(config.paymentMethods);
  items.push(config.RESET);

  function handleItemClick(item) {
    setAnchorEl(null);
    props.onAttributeClick({
      attribute: props.tableHeader,
      action: item === config.RESET ? null : item
    });
  }

  return (
    <div className="attribute-dropdown-content">
      <KeyboardArrowDownIcon
        sx={{
          cursor: 'pointer',
          color: props.queryParameter[props.tableHeader] !== null ? '#d592f4' : '#6237a0'
        }}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}>
      </KeyboardArrowDownIcon>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
        MenuListProps={{
          "aria-labelledby": "custom-dropdown",
        }}>
        {items.map((item, index) => (
          <MenuItem
            className="attribute-dropdown-item"
            key={item}
            onClick={() => { handleItemClick(item) }}>
            {item}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default TransactionTableHeaderCell;