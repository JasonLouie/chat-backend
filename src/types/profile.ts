import type { UserStatus } from "../enums.js";

export interface ProfileResponse {
    id: string;
    username: string;
    imageUrl: string | null;
    status: UserStatus;
    bio: string | null;
}

export interface UpdateProfileParams {
    bio?: string;
    imageUrl?: string;
}