import { EndpointError } from "../classes/EndpointError.js";
import { AppDataSource } from "../db/data-source.js";
import { Profile } from "../entities/Profile.js";
import type { UUID } from "../types/common.js";
import type { ProfileResponse } from "../types/profile.js";

export class ProfileService {
    private profileRepo = AppDataSource.getRepository(Profile);

    /**
     * Returns a user's profile. If it doesn't exist, an error is thrown.
     */
    async getProfile(userId: UUID | undefined): Promise<ProfileResponse> {
        if (userId === undefined) throw new EndpointError(400, "User id is required.");
        const profile = await this.profileRepo.findOne({
            where: { id: userId },
            relations: {
                user: true
            },
            select: {
                id: true,
                imageUrl: true,
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
            imageUrl: profile.imageUrl,
            status: profile.status,
            bio: profile.bio
        };
    }

    /**
     * PATCH /api/profile/me - Modify imageUrl or bio
     */
    async modifyProfile(userId: UUID, newImg?: string, newBio?: string) {
        const updates = {
            ...(newImg !== undefined && { imageUrl: newImg }),
            ...(newBio !== undefined && { bio: newBio })
        };

        // Do not run DB query if there are no updates
        if (Object.keys(updates).length === 0) return;

        const result = await this.profileRepo.update(userId, updates);
        if (result.affected === 0) {
            throw new EndpointError(404, "Profile does not exist.");
        }
    }
}