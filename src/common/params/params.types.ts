import type { UUID } from "../../common/types/common.js";

export interface UserParams {
    userId: UUID;
}

export interface ChatParams {
    chatId: UUID;
}

export interface ChatMemberParams {
    chatId: UUID;
    memberId: UUID;
}

export interface MessageParams {
    chatId: UUID;
    messageId: UUID;
}