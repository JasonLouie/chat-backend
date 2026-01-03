import type { Response, NextFunction } from "express";
import { AuthService } from "./auth.service.js";
import { TokenService } from "./tokens/token.service.js";
import { ProfileService } from "../users/profiles/profile.service.js";
import { clearAuthCookies, sendAuthCookies } from "../../common/utils/cookie.utils.js";
import { requireUser } from "../../common/utils/guard.js";
import type { RegisterDto } from "./auth.dto.js";
import type { TypedRequest } from "../../common/types/express.types.js";

export class AuthController {
    constructor(
        private authService: AuthService,
        private profileService: ProfileService,
        private tokenService: TokenService,
    ) {}

    /**
     * POST /api/auth/register
     */
    public register = async (req: TypedRequest<{}, {}, RegisterDto>, res: Response, next: NextFunction): Promise<void> => {
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
    public login = async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = requireUser(req);
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
    public logout = async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
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
    public refreshTokens = async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tokens = await this.tokenService.refresh(req.cookies);
            sendAuthCookies(tokens, res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}