import crypto from "crypto";

const generateVerificationToken = () => {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const expire = Date.now() + 24 * 60 * 60 * 1000;

    return { token, hashedToken, expire };
};

export const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

export default generateVerificationToken;
