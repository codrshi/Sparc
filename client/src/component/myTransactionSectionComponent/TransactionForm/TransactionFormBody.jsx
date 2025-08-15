import React, { useEffect } from "react";
import dayjs from "dayjs";
import {
  InputAdornment,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  Switch,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import MoneyIcon from "@mui/icons-material/Money";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import HouseIcon from "@mui/icons-material/House";
import GavelIcon from "@mui/icons-material/Gavel";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import TimelineIcon from "@mui/icons-material/Timeline";
import OutletIcon from "@mui/icons-material/Outlet";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import HandymanIcon from "@mui/icons-material/Handyman";
import MovieIcon from "@mui/icons-material/Movie";
import LocalAirportIcon from "@mui/icons-material/LocalAirport";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import ChairIcon from "@mui/icons-material/Chair";
import { isAmountValid } from "../../../utility/dataValidator.js";
import "../style/TransactionForm.css";
import config from "../../../configuration/config.js";
import { inputFieldStyle } from "../../Login/Login.jsx";

function TransactionFormBody(props) {

  return (<div className="transaction-form-body">
    <div>
      <InputAmountField
        formData={props.formData}
        setFormData={props.setFormData}
        handleChange={props.handleChange}
        isFieldsDisable={props.isFieldsDisable}>
      </InputAmountField>
      <InputDateField
        formData={props.formData}
        setFormData={props.setFormData}
        handleChange={props.handleChange}
        isFieldsDisable={props.isFieldsDisable}>
      </InputDateField>
      <InputTypeField
        formData={props.formData}
        setFormData={props.setFormData}
        handleChange={props.handleChange}
        isFieldsDisable={props.isFieldsDisable}>
      </InputTypeField>
    </div>
    <div>
      <InputAmountTypeField
        amountType={props.amountType}
        handleAmountTypeChange={props.handleAmountTypeChange}
        isFieldsDisable={props.isFieldsDisable}>
      </InputAmountTypeField>
      <InputPaymentMethodField
        formData={props.formData}
        setFormData={props.setFormData}
        handleChange={props.handleChange}
        isFieldsDisable={props.isFieldsDisable}>
      </InputPaymentMethodField>
    </div>
    <InputDescriptionField
      formData={props.formData}
      setFormData={props.setFormData}
      handleChange={props.handleChange}
      isFieldsDisable={props.isFieldsDisable}>
    </InputDescriptionField>
  </div>);
}

function InputAmountField(props) {
  return (<TextField
    disabled={props.isFieldsDisable}
    variant="outlined"
    label="Amount*"
    name="amount"
    value={props.formData.amount}
    helperText={
      isAmountValid(props.formData.amount) === false
        ? "allowed values: '0-9' , '.'"
        : ""
    }
    sx={{
      ...inputFieldStyle,
      ...transactionFormFieldStyle(props.isFieldsDisable)
    }}
    slotProps={{
      input: {
        className: isAmountValid(props.formData.amount)
          ? "input-field-focused-outline"
          : "input-field-outline-err",
        startAdornment: (
          <InputAdornment position="start"><span style={{ color: "var(--bg-color-2)" }}>₹</span></InputAdornment>
        ),
      },
      inputLabel: {
        className: isAmountValid(props.formData.amount)
          ? "input-field-focused-label"
          : "input-field-label-err",
      },
    }}
    onChange={props.handleChange}
  ></TextField>);
}

function InputDescriptionField(props) {
  return (<TextField
    disabled={props.isFieldsDisable}
    variant="outlined"
    label="Description"
    name="description"
    value={props.formData.description}
    sx={{
      ...inputFieldStyle,
      marginTop: "1rem",
      ...transactionFormFieldStyle(props.isFieldsDisable),
      "& .MuiFormHelperText-root": {
        color: props.formData.description.length > config.DESCRIPTION_CHARACTERS_LIMIT ? "red" : "var(--bg-color-2)"
      }
    }}
    helperText={
      <Typography
        component="span"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          padding: "0.5rem 0.5rem 0 0",
          fontSize: "0.75rem",
        }}
      >
        {`${props.formData.description.length}/${config.DESCRIPTION_CHARACTERS_LIMIT}`}
      </Typography>
    }
    onChange={props.handleChange}
    slotProps={{
      input: {
        className:
          props.formData.description.length > config.DESCRIPTION_CHARACTERS_LIMIT
            ? "input-field-outline-err"
            : "input-field-focused-outline",
      },
      inputLabel: {
        className:
          props.formData.description.length > config.DESCRIPTION_CHARACTERS_LIMIT
            ? "input-field-label-err"
            : "input-field-focused-label",
      },
    }}
  ></TextField>);
}

function InputDateField(props) {
  const toggleBodyScroll = (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  return (<LocalizationProvider dateAdapter={AdapterDayjs}>
    <DemoContainer
      components={["DatePicker"]}
      sx={{
        ...inputFieldStyle,
        marginLeft: "1rem",
        overflow: "visible",
        paddingTop: 0,
        ...transactionFormFieldStyle(props.isFieldsDisable),
      }}
    >
      <DatePicker
        disabled={props.isFieldsDisable}
        label="Transaction Date*"
        value={dayjs(props.formData.date)}
        disableFuture
        closeOnSelect={true}
        onOpen={() => toggleBodyScroll(true)}
        onClose={() => toggleBodyScroll(false)}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#6237a0",
            },
          },
          "& .MuiInputLabel-root": {
            color: "var(--bg-color-black-white)",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#6237a0",
          },
          "&:hover .MuiSvgIcon-root": {
            color: "#9754cb",
          },
          "&:focus-within .MuiSvgIcon-root": {
            color: "#6237a0",
          },
        }}
        onChange={(newDate) => {
          props.setFormData((prevData) => ({
            ...prevData,
            date: newDate.format("YYYY-MM-DD"),
          }));
        }}
      ></DatePicker>
    </DemoContainer>
  </LocalizationProvider>);
}

function InputTypeField(props) {
  return (<FormControl
    disabled={props.isFieldsDisable}
    variant="outlined"
    sx={{
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
      {
        borderColor: "#9754cb",
      },
      "&:hover .MuiInputLabel-root": {
        color: "#9754cb",
      },
      "& .MuiOutlinedInput-root": {
        "&.Mui-focused fieldset": {
          borderColor: "#6237a0 !important",
        },
      },
      marginLeft: "1rem",
      width: "15rem",
      ...transactionFormFieldStyle(props.isFieldsDisable)
    }}
  >
    <InputLabel
      sx={{
        "&.Mui-focused": {
          color: "#6237a0",
        },
      }}
    >
      Transaction Type*
    </InputLabel>
    <Select
      name="type"
      value={props.formData.type}
      renderValue={(selected) => selected}
      sx={{
        "& .MuiInputBase-input": {
          color: "var(--bg-color-black-white)",
        },
        "&:hover .MuiSelect-icon": {
          color: "#9754cb",
        },
        "&.Mui-focused .MuiSelect-icon": {
          color: "#6237a0",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#6237a0 !important", // Focus outline color
        },
        "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--bg-color-3) !important",
        },
        "& .MuiInputBase-input.Mui-disabled": {
          color: "var(--bg-color-3) !important", // Adjust text color when disabled
          "-webkit-text-fill-color": "var(--bg-color-3) !important"
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            "& .MuiList-root": {
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
            },
          },
        },
      }}
      onChange={props.handleChange}
      label="Transaction Type*"
    >
      {Object.entries(config.transactionTypes).map(([key, transactionType]) => (
        <MenuItem
          key={transactionType}
          value={transactionType}
          sx={{
            backgroundColor: "var(--bg-color-white-black)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            "&:hover": {
              color: "#9754cb",
              "& .MuiSvgIcon-root": {
                color: "#9754cb",
              },
              "& .input-field-menu-list-label": {
                color: "#9754cb",
              },
            },
          }}
        >
          <TransactionTypeIcon
            type={transactionType}
            color="var(--bg-color-3)"
            transistion="all 0.3s ease"
          ></TransactionTypeIcon>
          <span className="input-field-menu-list-label">
            {transactionType}
          </span>
        </MenuItem>
      ))}
    </Select>
  </FormControl>);
}

function InputPaymentMethodField(props) {
  return (<div className="payment-method-group">
    <span aria-required style={{ color: "var(--bg-color-2)" }}>Payment Method*</span>
    <div className="payment-method-button-group">
      <Button
        disabled={props.isFieldsDisable}
        variant="contained"
        startIcon={<MoneyIcon />}
        name="paymentMethod"
        value="Cash"
        className={[
          "payment-method-button",
          props.formData.paymentMethod === "Cash"
            ? "payment-method-clicked-button"
            : "",
        ].join(" ")}
        onClick={props.handleChange}
      >
        Cash
      </Button>
      <Button
        disabled={props.isFieldsDisable}
        variant="contained"
        startIcon={<CreditCardIcon />}
        name="paymentMethod"
        value="Card"
        className={[
          "payment-method-button",
          props.formData.paymentMethod === "Card"
            ? "payment-method-clicked-button"
            : "",
        ].join(" ")}
        sx={{ marginLeft: "1rem" }}
        onClick={props.handleChange}
      >
        Card
      </Button>
      <Button
        disabled={props.isFieldsDisable}
        variant="contained"
        startIcon={
          <SmartphoneIcon
            sx={{
              "& .MuiButton-startIcon": {
                color:
                  props.formData.paymentMethod === "Online"
                    ? "#6237a0"
                    : "var(--bg-color-3)",
              },
            }}
          />
        }
        name="paymentMethod"
        value="Online"
        className={[
          "payment-method-button",
          props.formData.paymentMethod === "Online"
            ? "payment-method-clicked-button"
            : "",
        ].join(" ")}
        sx={{ marginLeft: "1rem" }}
        onClick={props.handleChange}
      >
        Online
      </Button>
    </div>
  </div>);
}

function InputAmountTypeField(props) {
  return (<Stack direction="row" spacing={"0.5rem"} sx={{ alignItems: 'center' }}>
    <Typography className="input-amount-type-field-text">Credit</Typography>
    <AntSwitch
      disabled={props.isFieldsDisable}
      checked={props.amountType === config.transaction.amountType.DEBIT}
      onChange={props.handleAmountTypeChange}
      inputProps={{ 'aria-label': 'ant design' }} />
    <Typography className="input-amount-type-field-text">Debit</Typography>
  </Stack>);
}

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: "5rem",
  height: "2rem",
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: "2rem",
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(0.5rem)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: "0.25rem",
    '&.Mui-checked': {
      transform: 'translateX(3rem)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#fff1f1',
        ...theme.applyStyles('dark', {
          backgroundColor: '#177ddc',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "2rem",
    color: '#6237a0',
    transition: theme.transitions.create(['width'], {
      duration: 100,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: "2rem",
    opacity: 1,
    backgroundColor: '#f2fff2',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

export function transactionFormFieldStyle(isDisabled = false) {
  return {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--bg-color-2)"
      }
    },
    "& .MuiInputLabel-root": {
      color: "var(--bg-color-2)", // Default label color
    },
    "& .MuiInputLabel-root.Mui-disabled": {
      color: "var(--bg-color-3)"
    },
    "& .MuiFormHelperText-root": {
      color: "red", // Error/helper text color
    },
  }
}

export function TransactionTypeIcon(props) {
  const style = {
    height: "2rem",
    width: "2rem",
    color: props.color,
    transition: props.transistion,
  };
  switch (props.type) {
    case "Income":
      return <CurrencyRupeeIcon sx={style}></CurrencyRupeeIcon>;
    case "Rent":
      return <HouseIcon sx={style}></HouseIcon>;
    case "Tax":
      return <GavelIcon sx={style}></GavelIcon>;
    case "Insurance":
      return <HealthAndSafetyIcon sx={style}></HealthAndSafetyIcon>;
    case "Investment":
      return <TimelineIcon sx={style}></TimelineIcon>;
    case "Electricity":
      return <OutletIcon sx={style}></OutletIcon>;
    case "Water":
      return <WaterDropIcon sx={style}></WaterDropIcon>;
    case "Gas":
      return <LocalGasStationIcon sx={style}></LocalGasStationIcon>;
    case "Bill":
      return <ReceiptIcon sx={style}></ReceiptIcon>;
    case "Grocery":
      return <ShoppingCartIcon sx={style}></ShoppingCartIcon>;
    case "Shopping":
      return <ShoppingBasketIcon sx={style}></ShoppingBasketIcon>;
    case "Entertainment":
      return <MovieIcon sx={style}></MovieIcon>;
    case "Restaurant":
      return <RestaurantIcon sx={style}></RestaurantIcon>;
    case "Travel":
      return <LocalAirportIcon sx={style}></LocalAirportIcon>;
    case "Houseware":
      return <ChairIcon sx={style}></ChairIcon>;
    case "Service":
      return <HandymanIcon sx={style}></HandymanIcon>;
    case "Miscellaneous":
      return <MiscellaneousServicesIcon sx={style}></MiscellaneousServicesIcon>;
    default:
      return <MiscellaneousServicesIcon sx={style}></MiscellaneousServicesIcon>;
  }
}

export default TransactionFormBody;