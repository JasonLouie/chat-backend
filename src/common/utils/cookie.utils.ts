import type { Response, CookieOptions } from "express";
import type { Tokens } from "../../modules/auth/tokens/token.types.js";

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};

const refreshTokenPath = "/api/auth";

export const sendAuthCookies = (tokens: Tokens, res: Response): void => {
    const { accessToken, refreshToken } = tokens;

    // Access token expires after 20m
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 20 * 60 * 1000 });

    // Refresh token expires after 7d
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 3600 * 1000, path: refreshTokenPath });
}

export const clearAuthCookies = (res: Response): void => {
    // Clear access token cookie
    res.clearCookie("accessToken", cookieOptions);

    // Clear refresh token cookie
    res.clearCookie("refreshToken", { ...cookieOptions, path: refreshTokenPath });
}