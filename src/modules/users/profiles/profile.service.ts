import { EndpointError } from "../../../common/errors/EndpointError.js";
import { AppDataSource } from "../../../db/data-source.js";
import { Profile } from "./profile.entity.js";
import type { UUID } from "../../../common/types/common.js";
import type { ProfileResponse } from "./profile.types.js";

export class ProfileService {
    private profileRepo = AppDataSource.getRepository(Profile);

    /**
     * Returns a user's profile. If it doesn't exist, an error is thrown.
     */
    public getProfile = async (userId: UUID): Promise<ProfileResponse> => {
        const profile = await this.profileRepo.findOne({
            where: { id: userId },
            relations: {
                user: true
            },
            select: {
                id: true,
                displayName: true,
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
            displayName: profile.displayName,
            imageUrl: profile.imageUrl,
            status: profile.status,
            bio: profile.bio
        };
    }

    /**
     * Modify bio or displayName
     */
    public modifyProfile = async (userId: UUID, updates: Partial<Profile>): Promise<void> => {
        // Do not run DB query if there are no updates
        if (Object.keys(updates).length === 0) return;

        const result = await this.profileRepo.update(userId, updates);
        if (result.affected === 0) {
            throw new EndpointError(404, "Profile does not exist.");
        }
    }
}