import {
  Button
} from "@mui/material";
import "../style/TransactionForm.css";

function TransactionFormFooter(props) {
  return (<div className={'transaction-form-footer'}>
    <Button
      variant="outlined"
      id={
        props.isButtonDisabled
          ? 'disabled-submit-button'
          : 'enabled-submit-button'}
      className="transaction-form-button"
      disabled={props.isButtonDisabled}
      onClick={props.handleSubmit}
    >
      {props.submitButtonName}
    </Button>
    <Button
      variant="contained"
      id={'close-button'}
      className="button"
      onClick={props.onClose}
    >
      Close
    </Button>
  </div>);
}

export default TransactionFormFooter;