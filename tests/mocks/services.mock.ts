import { jest } from '@jest/globals';
import { AuthService } from "../../src/modules/auth/auth.service.js";
import { TokenService } from "../../src/modules/auth/tokens/token.service.js";
import { ChatService } from "../../src/modules/chats/chat.service.js";
import { ChatMemberService } from "../../src/modules/chats/members/chat-member.service.js";
import { MessageService } from "../../src/modules/chats/messages/message.service.js";
import { ProfileService } from "../../src/modules/users/profiles/profile.service.js";
import { UserService } from "../../src/modules/users/user.service.js";

export const mockUserService = {
    getUserFull: jest.fn(),
    updateUsername: jest.fn(),
    updatePassword: jest.fn(),
    updateEmail: jest.fn(),
    checkUsernameEmail: jest.fn(),
    countUsers: jest.fn(),
    deleteUser: jest.fn()
} as unknown as jest.Mocked<UserService>;

export const mockAuthService = {
    findUserById: jest.fn(),
    register: jest.fn(),
    validateUser: jest.fn()
} as unknown as jest.Mocked<AuthService>;

export const mockTokenService = {
    generateTokens: jest.fn(),
    refresh: jest.fn(),
    removeToken: jest.fn()
} as unknown as jest.Mocked<TokenService>;

export const mockProfileService = {
    getProfile: jest.fn(),
    modifyProfile: jest.fn()
} as unknown as jest.Mocked<ProfileService>;

export const mockChatService = {
    getUserChats: jest.fn(),
    createChat: jest.fn(),
    modifyChatGroup: jest.fn()
} as unknown as jest.Mocked<ChatService>;

export const mockChatMemberService = {
    getChatMembers: jest.fn(),
    leaveChat: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
    transferOwnership: jest.fn(),
    validateChatMembership: jest.fn()
} as unknown as jest.Mocked<ChatMemberService>;

export const mockMessageService = {
    searchMessages: jest.fn(),
    sendMessage: jest.fn(),
    updateMessage: jest.fn(),
    pinMessage: jest.fn(),
    deleteMessage: jest.fn()
} as unknown as jest.Mocked<MessageService>;

export const resetServiceMocks = () => {
    jest.clearAllMocks();
};
