import config from "../configuration/config.js";
import { errorMessageBuilder } from "../utility/builder/errorMessageBuilder.js";

class MissingEntryDBException extends Error {
  constructor(tableName, userId) {
    const errorMessage = errorMessageBuilder(config.errorCode[1005]);

    super(errorMessage);
    this.name = 'MissingEntryDBException';
    this.tableName = tableName;
    this.userId = userId;
    this.message = errorMessage;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingEntryDBException);
    }
  }
}

export default MissingEntryDBException;