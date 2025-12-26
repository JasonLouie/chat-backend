import type { Request, Response, NextFunction } from "express";
import type { User } from "./user.entity.js";
import { UserService } from "./user.service.js";
import { clearAuthCookies } from "../../utils/cookie.utils.js";

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/me
     */
    public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id }= req.user as User;
            const user = await this.userService.getUserFull(id);
            res.json(user);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/users/username
     */
    public updateUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as User;
            const { newUsername } = req.body;
            await this.userService.updateUsername(user.id, newUsername);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/users/password
     */
    public updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as User;
            const { oldPassword, newPassword } = req.body;
            await this.userService.updatePassword(user.id, oldPassword, newPassword);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/users/email
     */
    public updateEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user as User;
            const { newEmail, password } = req.body;
            await this.userService.updateEmail(user.id, newEmail, password);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/users
     */
    public deleteUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
        try {
            const user = req.user as User;
            await this.userService.deleteUser(user.id);
            clearAuthCookies(res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}