import config from "../configuration/config.js";
import { errorMessageBuilder } from "../utility/builder/errorMessageBuilder.js";

class ExpiredTokenException extends Error {
  constructor(invalidParam) {
    const errorMessage = errorMessageBuilder(config.errorCode[1004]);

    super(errorMessage);
    this.name = 'ExpiredTokenException';
    this.invalidParam = invalidParam;
    this.message = errorMessage;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExpiredTokenException);
    }
  }
}

export default ExpiredTokenException;