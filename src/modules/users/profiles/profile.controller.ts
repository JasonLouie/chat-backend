import type { Response, NextFunction } from "express";
import { ProfileService } from "./profile.service.js";
import type { UserParams } from "../../../common/params/params.types.js";
import type { ProtectedRequest } from "../../../common/types/express.types.js";
import type { ModifyProfileBody } from "./profile.types.js";
import { uploadToCloudinary } from "../../../common/utils/upload.utils.js";
import { ImageFolder } from "../../../common/types/common.js";
import { EndpointError } from "../../../common/errors/EndpointError.js";

export class ProfileController {
    private profileService: ProfileService;

    constructor(profileService: ProfileService) {
        this.profileService = profileService;
    }

    /**
     * GET /api/users/me/profile
     */
    public getMyProfile = async(req: ProtectedRequest<UserParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const profile = await this.profileService.getProfile(userId);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/users/:userId/profile
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
     * PATCH /api/users/me/profile - Modify bio or display name
     */
    public modifyProfile = async(req: ProtectedRequest<any, any, ModifyProfileBody>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const { newBio, newDisplayName } = req.body;
            const updates = {
                ...(newBio !== undefined && { bio: newBio }),
                ...(newDisplayName !== undefined && { displayName: newDisplayName }),
            }
            if (Object.keys(updates).length > 0){
                await this.profileService.modifyProfile(userId, updates);
            }
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/users/me/profile/upload-avatar
     */
    public updateProfilePicture = async(req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) throw new EndpointError(400, "No file uploaded.");

            const imageUrl = await uploadToCloudinary(req.file.buffer, ImageFolder.USER);
            const userId = req.user.id;
            await this.profileService.modifyProfile(userId, { imageUrl });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}