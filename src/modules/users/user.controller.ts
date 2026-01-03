import type { Response, NextFunction } from "express";
import { UserService } from "./user.service.js";
import { clearAuthCookies } from "../../common/utils/cookie.utils.js";
import { requireUser } from "../../common/utils/guard.js";
import type { UpdateEmailDto, UpdatePasswordDto, UpdateUsernameDto } from "./user.dto.js";
import type { TypedRequest } from "../../common/types/express.types.js";

export class UserController {
    constructor(
        private userService: UserService
    ) {}

    /**
     * GET /api/users/me
     */
    public getMe = async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);

            const fullUser = await this.userService.getUserFull(user.id);
            res.json(fullUser);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/users/username
     */
    public updateUsername = async (req: TypedRequest<{}, {}, UpdateUsernameDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { newUsername } = req.body;

            await this.userService.updateUsername(user.id, newUsername);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/users/password
     */
    public updatePassword = async (req: TypedRequest<{}, {}, UpdatePasswordDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { oldPassword, newPassword } = req.body;

            await this.userService.updatePassword(user.id, oldPassword, newPassword);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/users/email
     */
    public updateEmail = async (req: TypedRequest<{}, {}, UpdateEmailDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
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
    public deleteUser = async (req: TypedRequest, res: Response, next: NextFunction) : Promise<void> => {
        try {
            const user = requireUser(req);

            await this.userService.deleteUser(user.id);
            clearAuthCookies(res);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}