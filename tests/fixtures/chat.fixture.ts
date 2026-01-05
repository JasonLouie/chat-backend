import type { Chat } from "../../src/modules/chats/chat.entity.js";
import { ChatRole, ChatType } from "../../src/modules/chats/chat.types.js";
import type { ChatMember } from "../../src/modules/chats/members/chat-member.entity.js";

export const TEST_CHAT_ID = "uuid-1234-5678-9101";
export const TEST_CHAT_NAME = "Group";
export const TEST_GROUP_IMAGE_URL = "https://cloudinary.com/group-pic.jpg";

export const createChat = (
    type: ChatType = ChatType.DM,
    overrides?: Partial<Chat>
): Chat => {
    return {
        id: TEST_CHAT_ID,
        ...(type === ChatType.GROUP && { imageUrl: TEST_GROUP_IMAGE_URL }),
        ...(type === ChatType.GROUP && { name: TEST_CHAT_NAME }),
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...overrides
    } as Chat;
}

export const createChatMembers = (
    type: ChatRole = ChatRole.MEMBER,
    overrides?: Partial<ChatMember>
) => {
    return 
}