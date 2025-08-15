import config from "../configuration/config.js";
import { errorMessageBuilder } from "../utility/builder/errorMessageBuilder.js";

class InvalidParameterException extends Error {
  constructor(invalidParam, invalidValue, endpoint) {
    const errorMessage = errorMessageBuilder(config.errorCode[1003], invalidParam);

    super(errorMessage);
    this.name = 'InvalidParameterException';
    this.invalidParam = invalidParam;
    this.invalidValue = invalidValue;
    this.message = errorMessage;
    this.endpoint = endpoint;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidParameterException);
    }
  }
}

export default InvalidParameterException;