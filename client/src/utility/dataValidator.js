export function isAmountValid(amount) {
    return amount !== "" && /^-?\d*(\.\d{1,2})?$/.test(amount) === true && parseFloat(amount) !== 0;
};

export function isPercentageValid(percentage) {
    return isAmountValid(percentage) && percentage < 100;
}

export function isUsernameValid(username) {
    const regex = /^(?!.*[_.]{2})[a-zA-Z0-9][a-zA-Z0-9._]{1,18}[a-zA-Z0-9]$/;

    if (!username) return { valid: false, message: "Username is required" };
    if (username.length < 3 || username.length > 20) {
        return { valid: false, message: "Username must be between 3 and 20 characters" };
    }
    if (!regex.test(username)) {
        return { valid: false, message: "Invalid username format" };
    }

    return { valid: true, message: "" };
};

export function isPasswordValid(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/;

    if (!password) return { valid: false, message: "Password is required" };
    if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters long" };
    if (!regex.test(password)) {
        return { valid: false, message: "Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character" };
    }

    return { valid: true, message: "" };
};

export function isEmailValid(input) {
    const emailPattern = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

    if (!input) return { valid: false, message: "Email is required" };

    if (!emailPattern.test(input)) {
        return { valid: false, message: "Invalid email format" };
    }

    return { valid: true, message: "" };
};

export function isVerificationCodeValid(input) {
    return input && /^\d{6}$/.test(input);
}