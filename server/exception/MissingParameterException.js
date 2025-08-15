import config from "../configuration/config.js";
import { errorMessageBuilder } from "../utility/builder/errorMessageBuilder.js";

class MissingParameterException extends Error {
  constructor(missingParam, endpoint) {
    const errorMessage = errorMessageBuilder(config.errorCode[1002], missingParam);

    super(errorMessage);
    this.name = 'MissingParameterException';
    this.missingParam = missingParam;
    this.endpoint = endpoint;
    this.message = errorMessage;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingParameterException);
    }
  }
}

export default MissingParameterException;