import type { Request, Response, NextFunction, CookieOptions } from "express";
import { AuthService } from "../services/AuthService.js";
import { TokenService, type Tokens } from "../services/TokenService.js";
import { ProfileService } from "../services/ProfileService.js";

const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
};

const refreshTokenPath = "/api/auth";

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
    private authService = new AuthService;
    private profileService = new ProfileService;
    private tokenService = new TokenService;

    /**
     * POST /api/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body;
            const user = await this.authService.register(username, email, password);
            const [tokens, fullProfile] = await Promise.all([this.tokenService.generateTokens(user.id), this.profileService.getProfileWithUser(user.id)]);
            sendCookies(tokens, res);
            res.json(fullProfile);
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
    
    /**
     * POST /api/auth/logout
     */
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * POST /api/auth/refresh
     */
    async refreshTokens(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * PUT /api/auth/password
     */
    async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * PUT /api/auth/email
     */
    async updateEmail(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * PUT /api/auth/username
     */
    async updateUsername(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * DELETE /api/auth/delete
     */
    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error: any) {
            next(error);
        }
    }
}