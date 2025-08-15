import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEffect, useState } from "react";
import { inputFieldStyle } from "../Login/Login";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { transactionFormFieldStyle } from "../myTransactionSectionComponent/TransactionForm/TransactionFormBody";
import BlurCircularIcon from '@mui/icons-material/BlurCircular';
import "./style/FinancialAdvisor.css";
import { IconButton, Tooltip } from "@mui/material";
import axios from "axios";
import config from "../../configuration/config";
import emptyStateImage from "../../asset/no_transaction_empty_state.png";

const inputDate = Object.freeze({
  START: 'start date',
  END: 'end date'
});

function FinancialAdvisor(props) {

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const [credits, setCredits] = useState(0);
  const [isNewAccount, setIsNewAccount] = useState(true);
  const [advice, setAdvice] = useState("");

  useEffect(() => {
    if (config.db.isQueryExecuting.financialAdvisor)
      return;

    config.db.isQueryExecuting.financialAdvisor = true;
    axios.get(`${config.endpoints.financialAdvisor.CREDITS}`, {
    })
      .then((response) => {
        setCredits(() => response.data.credits);
        setIsNewAccount(() => response.data.isNewAccount);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to fetch credits.", severity: config.alertSeverity.ERROR }));
      })
      .finally(() => { config.db.isQueryExecuting.financialAdvisor = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAdviceClick() {
    if (credits <= 0 || config.db.isQueryExecuting.financialAdvisor)
      return;

    config.db.isQueryExecuting.financialAdvisor = true;
    axios.get(`${config.endpoints.financialAdvisor.ADVICE}`, {
      params: {
        startDate: startDate,
        endDate: endDate
      }
    })
      .then((response) => {
        setAdvice(() => response.data.advice);
        if (response.data.credits !== null && response.data.credits !== undefined)
          setCredits(() => response.data.credits);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.error)
          props.setAlertLabel(() => ({ text: error.response.data.error, severity: config.alertSeverity.ERROR }));
        else
          props.setAlertLabel(() => ({ text: "Failed to generate advice.", severity: config.alertSeverity.ERROR }));
      })
      .finally(() => { config.db.isQueryExecuting.financialAdvisor = false; });
  }

  return (<>
    <div className="board-header">
      <span>Financial Advisor</span>
      <span className="credits-left-heading"><span>{credits}</span> credits left</span>
    </div>
    {isNewAccount && <div id="financial-advisor-body" className="board-body">
      <div className="financial-advisor-body-component">
        <span id="financial-advisor-description">Receive personalized financial advice powered by AI, based on your historical expense patterns and financial behavior over a selected time range (minimum one month)</span>
      </div>
      <div className="financial-advisor-body-component">
        <div className="financial-advisor-input">
          <span>Select month period</span>
          <div className="financial-advisor-input-field">
            <InputDateField
              date={startDate}
              setDate={(newDate) => {
                setStartDate(() => newDate.format("YYYY-MM-DD"));
                //newDate.setDate(newDate.getDate() + 30);
                setEndDate(() => newDate.add(30, 'day').format("YYYY-MM-DD"));
              }}
              label={inputDate.START}>
            </InputDateField>
            <InputDateField
              date={endDate}
              setDate={setEndDate}
              label={inputDate.END}>
            </InputDateField>
            <Tooltip title={"generate advice"}>
              <IconButton className={["generate-advice-button", credits <= 0 ? "disabled-advice-button" : ""].join(' ')} disabled={credits <= 0} onClick={() => handleAdviceClick()}>
                <BlurCircularIcon sx={{ width: "100%", height: "100%" }}></BlurCircularIcon>
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
      <div id="ai-advice-body" className="financial-advisor-body-component">
        <span dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br/>') }} />
      </div>
    </div>}
    {!isNewAccount && <AdvisorNotAvailableState></AdvisorNotAvailableState>}
  </>)
}

function InputDateField(props) {

  const date = new Date();
  date.setDate(date.getDate() - 30);

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
        ...transactionFormFieldStyle(false),
      }}
    >
      <DatePicker
        label={props.label + "*"}
        value={dayjs(props.date)}
        maxDate={props.label === inputDate.START ? dayjs(date.toISOString().split('T')[0]) : null}
        minDate={props.label === inputDate.END ? dayjs(props.date) : null}
        disableFuture
        closeOnSelect={true}
        onOpen={() => toggleBodyScroll(true)}
        onClose={() => toggleBodyScroll(false)}
        sx={{
          width: "10vw",
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
        onChange={(newDate) => props.setDate(newDate)}
      ></DatePicker>
    </DemoContainer>
  </LocalizationProvider>);
}

function AdvisorNotAvailableState() {
  return (
    <div className='empty-state-body'>
      <img src={emptyStateImage} alt=''></img>
      <span>Feature not available</span>
      <span>Your account should be atleast 1 month old to use this feature.</span>
    </div>);
}

export default FinancialAdvisor;