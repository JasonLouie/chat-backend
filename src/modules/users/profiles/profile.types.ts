import type { UUID } from "../../../common/types/common.js";
import type { UserStatus } from "../user.types.js";

export interface ProfileResponse {
    id: UUID;
    username: string;
    displayName: string;
    imageUrl: string | null;
    status: UserStatus;
    bio: string | null;
}

export interface ModifyProfileBody {
    newBio?: string;
    newImageUrl?: string;
}