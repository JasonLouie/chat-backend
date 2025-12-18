import type { UserStatus } from "../enums.js";

export interface ProfileResponse {
    id: string;
    username: string;
    image_url: string | null;
    status: UserStatus;
    bio: string | null;
}

export interface UpdateProfileParams {
    bio?: string;
    image_url?: string;
}