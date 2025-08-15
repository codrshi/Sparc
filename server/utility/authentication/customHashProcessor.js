import config from "../../configuration/config.js";

function customHash(input, hashingRounds = config.hashingRounds.MIN_VALUE) {
    let hash = 0x811c9dc5;
    let prime = 0x01000193;
    let mixFactor = 31;

    for (let round = 0; round < hashingRounds; round++) {
        for (let i = 0; i < input.length; i++) {
            let charCode = input.charCodeAt(i);

            hash ^= charCode;
            hash *= prime;

            hash = (hash << 5) | (hash >>> 27);
            hash ^= (charCode * mixFactor);
        }
    }

    return (hash >>> 0).toString(16);
}

export default customHash;
