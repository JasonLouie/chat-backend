import type { Response, NextFunction } from "express";
import { ProfileService } from "./profile.service.js";
import type { UserParams } from "../../../common/params/params.types.js";
import type { ProtectedRequest } from "../../../common/types/express.types.js";
import type { ModifyProfileBody } from "./profile.types.js";

export class ProfileController {
    private profileService: ProfileService;

    constructor(profileService: ProfileService) {
        this.profileService = profileService;
    }

    /**
     * GET /api/profile/me
     */
    public getMyProfile = async(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const profile = await this.profileService.getProfile(userId);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/profile/:userId
     */
    public getUserProfile = async(req: ProtectedRequest<UserParams>, res: Response, next: NextFunction): Promise<void> => {
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
    public modifyProfile = async(req: ProtectedRequest<any, any, ModifyProfileBody>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const { newBio, newImageUrl } = req.body;
            await this.profileService.modifyProfile(userId, newBio, newImageUrl);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}