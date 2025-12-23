import type { Response, Request, NextFunction } from "express";
import { ProfileService } from "../services/ProfileService.js";
import type { User } from "../entities/User.js";

export class ProfileController {
    private profileService: ProfileService;

    constructor(profileService: ProfileService) {
        this.profileService = profileService;
    }

    /**
     * GET /api/profile/me
     */
    public getMyProfile = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.user as User;
            const profile = await this.profileService.getProfile(id);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/profile/:id
     */
    public getUserProfile = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const profile = await this.profileService.getProfile(id!);
            res.json(profile);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/profile/me - Modify imageUrl or bio
     */
    public modifyProfile = async(req: Request, res: Response, next: NextFunction) => {
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