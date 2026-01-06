import type { Chat } from "../../src/modules/chats/chat.entity.js";
import { ChatRole, ChatType } from "../../src/modules/chats/chat.types.js";
import type { ChatMember } from "../../src/modules/chats/members/chat-member.entity.js";
import type { Message } from "../../src/modules/chats/messages/message.entity.js";
import { MessageType } from "../../src/modules/chats/messages/message.types.js";
import { TEST_USER_ID } from "./user.fixture.js";

export const TEST_CHAT_ID = "chat-id-1";
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
    type: ChatType = ChatType.DM,
    count: number = 2,
    overrides?: Partial<ChatMember>
): ChatMember[] => {
    const memberCount = (count < 2 || type === ChatType.DM) ? 2 : count;
    
    const members = [
        {
            chatId: overrides?.chatId || TEST_CHAT_ID,
            userId: "id-1",
            role: ChatRole.OWNER,
            joinedAt: new Date(),
            lastReadAt: new Date()
        }
    ] as ChatMember[];

    for (let i = 2; i <= memberCount; i++) {
        members.push({
            chatId: overrides?.chatId || TEST_CHAT_ID,
            userId: `id-${i}`,
            role: ChatRole.MEMBER,
            joinedAt: new Date(),
            lastReadAt: new Date()
        } as ChatMember);
    }

    return members;
}

export const createMessages = (
    type: MessageType = MessageType.TEXT,
    count: number = 1,
    overrides?: Partial<Message>
): Message[] => {
    const messageCount = count < 1 ? 1 : count;
    const messages: Message[] = [];

    for (let i = 1; i <= messageCount; i++) {
        messages.push({
            chatId: TEST_CHAT_ID,
            senderId: TEST_USER_ID,
            content: `message #${i}`,
            pinned: false,
            type,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastReadAt: new Date(),
            ...overrides
        } as Message);
    }

    return messages;
}