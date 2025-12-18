import { EndpointError } from "../classes/EndpointError.js";
import { AppDataSource } from "../db/data-source.js";
import { Profile } from "../entities/Profile.js";
import type { ProfileResponse } from "../types/profile.js";

export class ProfileService {
    private profileRepo = AppDataSource.getRepository(Profile);

    /**
     * GET /api/profile/me
     */
    async getProfileWithUser(userId: string): Promise<ProfileResponse | null> {
        const profile = await this.profileRepo.findOne({
            where: { id: userId },
            relations: {
                user: true
            },
            select: {
                id: true,
                image_url: true,
                status: true,
                bio: true,
                user: {
                    username: true
                }
            }
        });

        if (!profile) throw new EndpointError(404, "User does not exist.");

        return {
            id: profile.id,
            username: profile.user.username,
            image_url: profile.image_url,
            status: profile.status,
            bio: profile.bio
        };
    }

    /**
     * PATCH /api/profile/me - Modify image_url or bio
     */
}