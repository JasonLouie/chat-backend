import type { UserStatus } from "../../../enums.js";
import type { UUID } from "../../../types/common.js";

export interface ProfileResponse {
    id: UUID;
    username: string;
    displayName: string;
    imageUrl: string | null;
    status: UserStatus;
    bio: string | null;
}

export interface UpdateProfileParams {
    bio?: string;
    imageUrl?: string;
}