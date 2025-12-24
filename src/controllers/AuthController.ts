import type { Request, Response, NextFunction, CookieOptions } from "express";
import { AuthService } from "../services/AuthService.js";
import { TokenService } from "../services/TokenService.js";
import { ProfileService } from "../services/ProfileService.js";
import type { Tokens } from "../types/common.js";
import type { User } from "../entities/User.js";

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
    private authService: AuthService;
    private profileService: ProfileService;
    private tokenService: TokenService;

    constructor(authService: AuthService, profileService: ProfileService, tokenService: TokenService) {
        this.authService = authService;
        this.profileService = profileService;
        this.tokenService = tokenService;
    }

    /**
     * POST /api/auth/register
     */
    public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { username, email, password } = req.body;
            const user = await this.authService.register(username, email, password);
            const [tokens, fullProfile] = await Promise.all([
                this.tokenService.generateTokens(user.id),
                this.profileService.getProfile(user.id)
            ]);
            sendCookies(tokens, res);
            res.json(fullProfile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/auth/login
     */
    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as User;
            const [tokens, fullProfile] = await Promise.all([
                this.tokenService.generateTokens(user.id),
                this.profileService.getProfile(user.id)
            ]);
            sendCookies(tokens, res);
            res.json(fullProfile);
        } catch (err) {
            next(err);
        }
    }
    
    /**
     * POST /api/auth/logout
     */
    public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.tokenService.removeToken(req.cookies);
            clearCookies(res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/auth/refresh
     */
    public refreshTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tokens = await this.tokenService.refresh(req.cookies);
            sendCookies(tokens, res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/auth/username
     */
    public updateUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as User;
            const { newUsername } = req.body;
            await this.authService.updateUsername(user.id, newUsername);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/auth/password
     */
    public updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as User;
            const { oldPassword, newPassword } = req.body;
            await this.authService.updatePassword(user.id, oldPassword, newPassword);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/auth/email
     */
    public updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as User;
            const { newEmail, password } = req.body;
            await this.authService.updateEmail(user.id, newEmail, password);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/auth/delete
     */
    public deleteUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
        try {
            const user = req.user as User;
            await this.authService.deleteUser(user.id);
            clearCookies(res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}