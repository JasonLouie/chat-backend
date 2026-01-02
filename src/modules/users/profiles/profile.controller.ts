import type { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service.js";
import { uploadToCloudinary } from "../../../common/utils/upload.utils.js";
import { ImageFolder } from "../../../common/types/common.js";
import { requireFile, requireUser } from "../../../common/utils/guard.js";
import type { ModifyProfileDto } from "./profile.dto.js";
import type { UserParamsDto } from "../../../common/params/params.dto.js";

export class ProfileController {
    constructor(
        private profileService: ProfileService
    ) {}

    /**
     * GET /api/users/me/profile
     */
    public getMyProfile = async(req: Request<UserParamsDto, {}, {}, {}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);

            const profile = await this.profileService.getProfile(user.id);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/users/:userId/profile
     */
    public getUserProfile = async(req: Request<UserParamsDto, {}, {}, {}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            requireUser(req);

            const { userId } = req.params;
            const profile = await this.profileService.getProfile(userId);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/users/me/profile - Modify bio or display name
     */
    public modifyProfile = async(req: Request<{}, {}, ModifyProfileDto, {}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { newBio, newDisplayName } = req.body;
            
            await this.profileService.modifyProfile(user.id, { bio: newBio, displayName: newDisplayName });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/users/me/profile/upload-avatar
     */
    public updateProfilePicture = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const file = requireFile(req);

            const imageUrl = await uploadToCloudinary(file.buffer, ImageFolder.USER);
            await this.profileService.modifyProfile(user.id, { imageUrl });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}