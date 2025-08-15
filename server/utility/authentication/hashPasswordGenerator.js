import config from "../../configuration/config.js";
import customHash from "./customHashProcessor.js";
import generateSalt from "./saltGenerator.js";
import mergeSalt from "./saltmerger.js";

function hashPassword(password) {
    const salt = generateSalt();
    const hashingRounds = Math.floor(Math.random() * (config.hashingRounds.MAX_VALUE - config.hashingRounds.MIN_VALUE + 1)) + config.hashingRounds.MIN_VALUE;
    const hashedPasswordWithSalt = salt + customHash(mergeSalt(password, salt), hashingRounds);

    return {
        hashingRounds: hashingRounds,
        hashedPasswordWithSalt: hashedPasswordWithSalt
    }
}

export default hashPassword;