import type { Response, Request, NextFunction } from "express";
import { ProfileService } from "./profile.service.js";
import type { User } from "../user.entity.js";
import type { UserParams } from "../../../common/params/params.types.js";

export class ProfileController {
    private profileService: ProfileService;

    constructor(profileService: ProfileService) {
        this.profileService = profileService;
    }

    /**
     * GET /api/profile/me
     */
    public getMyProfile = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.user as User;
            const profile = await this.profileService.getProfile(id);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/profile/:userId
     */
    public getUserProfile = async(req: Request<UserParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { userId } = req.params;
            const profile = await this.profileService.getProfile(userId);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/profile - Modify imageUrl or bio
     */
    public modifyProfile = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.user as User;
            const { newImg, newBio } = req.body;
            await this.profileService.modifyProfile(id, newImg, newBio);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}