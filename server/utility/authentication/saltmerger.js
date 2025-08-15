function mergeSalt(password, salt) {
    let mergedPassword = '';

    for (let i = 0; i < Math.max(salt.length, password.length); i++) {
        if (i < password.length) mergedPassword += password[i];
        if (i < salt.length) mergedPassword += salt[i];
    }

    return mergedPassword;
}

export default mergeSalt;