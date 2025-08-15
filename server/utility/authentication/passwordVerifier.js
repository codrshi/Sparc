import customHash from "./customHashProcessor.js";
import mergeSalt from "./saltmerger.js";

function verifyPassword(inputPassword, storedHashedPasswordWithSalt, hashingRounds) {
    let salt = storedHashedPasswordWithSalt.substring(0, 16);
    let storedHashedPassword = storedHashedPasswordWithSalt.substring(16);

    let newHashedPassword = customHash(mergeSalt(inputPassword, salt), hashingRounds);

    return newHashedPassword === storedHashedPassword;
}

export default verifyPassword;
