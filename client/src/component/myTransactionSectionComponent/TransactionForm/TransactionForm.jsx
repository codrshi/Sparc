import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "../style/TransactionForm.css";
import { isAmountValid } from "../../../utility/dataValidator.js";
import TransactionFormBody from "./TransactionFormBody";
import TransactionFormFooter from "./TransactionFormFooter";
import config from "../../../configuration/config.js";
import { transactionComparator } from "../../../utility/transactionComparator.js";

function TransactionForm(props) {
  let [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [amountType, setAmountType] = useState(props.defaultAmountType);
  const [formData, setFormData] = useState({
    amount: "",
    type: "",
    paymentMethod: "",
    date: dayjs().format("YYYY-MM-DD"),
    description: "",
  });

  useEffect(() => {
    if (props.showForm.transaction != null) {
      setFormData({
        ...props.showForm.transaction,
        amount: (props.showForm.transaction.amount.startsWith("-") ? props.showForm.transaction.amount.substring(1) : props.showForm.transaction.amount)
      });
    }
  }, [props.showForm]);

  useEffect(() => {
    setIsButtonDisabled(
      formData.paymentMethod === "" ||
      formData.amount === "" ||
      formData.description.length > config.DESCRIPTION_CHARACTERS_LIMIT ||
      !isAmountValid(formData.amount) ||
      formData.type === "" ||
      (props.showForm.formHeading === props.operationType.EDIT && transactionComparator(formData, props.showForm.transaction) && amountType === props.defaultAmountType)
    );
  }, [isButtonDisabled, formData, props, amountType]);


  function handleAmountTypeChange(e) {
    setAmountType(e.target.checked ? config.transaction.amountType.DEBIT : config.transaction.amountType.CREDIT);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    if (isButtonDisabled) return;
    e.preventDefault();
    if (amountType === config.transaction.amountType.DEBIT) {
      formData.amount = -1 * formData.amount;
    }
    props.onSubmit(props.showForm.formHeading === props.operationType.DELETE ? null : formData, props.showForm.transaction, props.showForm.formHeading);
    props.onClose();
  }

  if (props.showForm == null) return null;

  return (
    <div className="transaction-form">
      <div className="transaction-form-content">
        <span className="transaction-form-heading">
          {props.showForm.formHeading}
        </span>
        <TransactionFormBody
          formData={formData}
          isFieldsDisable={props.showForm.formHeading === props.operationType.DELETE}
          setFormData={setFormData}
          amountType={amountType}
          handleAmountTypeChange={handleAmountTypeChange}
          handleChange={handleChange}>
        </TransactionFormBody>
        <TransactionFormFooter
          isButtonDisabled={isButtonDisabled}
          handleSubmit={handleSubmit}
          submitButtonName={props.showForm.submitButtonName}
          onClose={props.onClose}
        >
        </TransactionFormFooter>
      </div>
    </div>
  );
}

export default TransactionForm;
