import type { Response, NextFunction } from "express";
import { UserService } from "./user.service.js";
import { clearAuthCookies } from "../../common/utils/cookie.utils.js";
import type { ProtectedRequest } from "../../common/types/express.types.js";

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/me
     */
    public getMe = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const user = await this.userService.getUserFull(userId);
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/users/username
     */
    public updateUsername = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const { newUsername } = req.body;
            await this.userService.updateUsername(userId, newUsername);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/users/password
     */
    public updatePassword = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;
            await this.userService.updatePassword(userId, oldPassword, newPassword);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/users/email
     */
    public updateEmail = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const { newEmail, password } = req.body;
            await this.userService.updateEmail(userId, newEmail, password);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/users
     */
    public deleteUser = async (req: ProtectedRequest, res: Response, next: NextFunction) : Promise<void> => {
        try {
            const userId = req.user.id;
            await this.userService.deleteUser(userId);
            clearAuthCookies(res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}