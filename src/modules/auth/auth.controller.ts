import type { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { TokenService } from "./tokens/token.service.js";
import { ProfileService } from "../users/profiles/profile.service.js";
import type { User } from "../users/user.entity.js";
import { clearAuthCookies, sendAuthCookies } from "../../common/utils/cookie.utils.js";

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
            sendAuthCookies(tokens, res);
            res.status(201).json(fullProfile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/auth/login
     */
    public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.user as User;
            const [tokens, fullProfile] = await Promise.all([
                this.tokenService.generateTokens(id),
                this.profileService.getProfile(id)
            ]);
            sendAuthCookies(tokens, res);
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
            clearAuthCookies(res);
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
            sendAuthCookies(tokens, res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}