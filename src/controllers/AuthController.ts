import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.js";

interface CookieOptions {
    httpOnly: boolean,
    secure: boolean,
    sameSite: boolean | "none" | "lax" | "strict" | undefined
}

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};

const refreshTokenPath = "/api/auth";

interface Tokens {
    accessToken: string,
    refreshToken: string
}

function sendCookies(tokens: Tokens, res: Response) {
    const { accessToken, refreshToken } = tokens;

    // Access token expires after 20m
    res.cookie("accessToken", accessToken, { ...cookieOptions, maxAge: 20 * 60 * 1000 });

    // Refresh token expires after 7d
    res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 3600 * 1000, path: refreshTokenPath });
}

function clearCookies(res: Response) {
    // Clear access token cookie
    res.clearCookie("accessToken", cookieOptions);

    // Clear refresh token cookie
    res.clearCookie("refreshToken", { ...cookieOptions, path: refreshTokenPath });
}

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService;
    }

    /**
     * POST /api/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;

            const user = await this.authService.register(username, email, password);

        } catch (error: any) {
            next(error);
        }
    }

    /**
     * POST /api/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error: any) {
            next(error);
        }
    }
}