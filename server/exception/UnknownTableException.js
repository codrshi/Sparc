import { errorMessageBuilder } from "../utility/builder/errorMessageBuilder.js";

class UnknownTableException extends Error {
  constructor(errorMsg, unknownTable, expectedTables) {
    const errorMessage = errorMessageBuilder(errorMsg, unknownTable, expectedTables);

    super(errorMessage);
    this.name = 'UnknownTableException';
    this.unknownTable = unknownTable;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownTableException);
    }
  }
}

export default UnknownTableException;