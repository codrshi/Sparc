import jwt from "jsonwebtoken";


const SECRET_KEY = process.env.JWT_SECRET_KEY || "your-secret-key";
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "your_refresh_secret";

export function getAccessToken(tokenPayload) {
    return jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1h" });
}

export function getRefreshToken(userId) {
    return jwt.sign({ id: userId }, REFRESH_SECRET_KEY, { expiresIn: "7d" });
}