import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { Response } from "express";
import { ChatController } from "../../../../src/modules/chats/chat.controller.js";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { mockChatService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createTestUser } from "../../../fixtures/user.fixture.js";
import uploadUtils from "../../../../src/common/utils/upload.utils.js";
import { expectNextError, expectStatus204, expectSuccess, genericError, testRequiresFile, testRequiresUser } from "../../../utils/testHelpers.js";
import type { Chat } from "../../../../src/modules/chats/chat.entity.js";
import { createChat, createChatMembers, createMessages, TEST_CHAT_ID, TEST_GROUP_IMAGE_URL } from "../../../fixtures/chat.fixture.js";
import { ChatType } from "../../../../src/modules/chats/chat.types.js";
import type { Message } from "../../../../src/modules/chats/messages/message.entity.js";
import type { ChatMember } from "../../../../src/modules/chats/members/chat-member.entity.js";
import { MessageType } from "../../../../src/modules/chats/messages/message.types.js";
import type { ChatParamsDto } from "../../../../src/common/params/params.dto.js";
import type { TypedRequest } from "../../../../src/common/types/express.types.js";
import { createMockFile } from "../../../utils/file.factory.js";
import { ImageFolder } from "../../../../src/common/types/common.js";

describe("ChatController", () => {
    const chatController = new ChatController(
        mockChatService
    );

    let uploadSpy: any;
    let req: MockRequest<TypedRequest<ChatParamsDto>>;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();
        
        req = createRequest({
            user: createTestUser()
        });
        res = createResponse();
        next = jest.fn();

        uploadSpy = jest.spyOn(uploadUtils, "uploadToCloudinary");
    });

    afterEach(() => {
        // Restore original function after each test
        jest.restoreAllMocks();
    });

    describe("getUserChats", () => {
        let chats: Chat[];

        beforeEach(() => {
            const [message] = createMessages(MessageType.TEXT, 1, { chatId: "chat-id-1" });
            chats = [createChat(ChatType.DM, { lastMessage: message!, numParticipants: 2 })];
            for (let i = 2; i < 5; i++) {
                chats.push(createChat(ChatType.DM, { id: `chat-id-${i}`, lastMessage: { ...message!, chatId: `chat-id-${i}` }, numParticipants: 2 }));
            }
        });

        testRequiresUser(chatController.getUserChats);

        it("should retrieve an array of all chats the user is in", async () => {
            mockChatService.getUserChats.mockResolvedValue(chats);

            await chatController.getUserChats(req, res, next);

            expectSuccess(mockChatService.getUserChats, [req.user!.id], res);

            const expectedResponse = JSON.parse(JSON.stringify(chats));
            expect(res._getJSONData()).toEqual(expectedResponse);
        });

        it("should pass service errors to next", async () => {
            mockChatService.getUserChats.mockRejectedValue(genericError);

            await chatController.getUserChats(req, res, next);

            expectNextError(next, res);

            expect(mockChatService.getUserChats).toHaveBeenCalledWith(req.user!.id);
        });
    });

    describe("createChat", () => {
        let chat: Chat;
        let members: ChatMember[];
        let messages: Message[];

        beforeEach(() => {
            chat = createChat();
            members = createChatMembers(ChatType.GROUP, 3);
            messages = [];

            req.method = "POST";
            req.body = {
                memberIds: members.map(m => m.userId),
                name: "test group"
            };
        });

        testRequiresUser(chatController.createChat);

        it("should create a new chat and return the chat, members, and messages", async () => {
            const resolvedValue = { chat, members, messages };

            mockChatService.createChat.mockResolvedValue(chat);
            mockChatService.getChatDetails.mockResolvedValue(resolvedValue);
        
            await chatController.createChat(req, res, next);

            expectSuccess(
                mockChatService.createChat,
                [req.user!.id, req.body.memberIds, req.body.name],
                res,
                201
            );

            expect(mockChatService.getChatDetails).toHaveBeenCalledWith(chat.id, req.user!.id);

            const expectedResponse = JSON.parse(JSON.stringify(resolvedValue));
            expect(res._getJSONData()).toEqual(expectedResponse);
        });

        it("should pass service errors to next and not call getChatDetails when chat creation failed", async () => {
            mockChatService.createChat.mockRejectedValue(genericError);

            await chatController.createChat(req, res, next);

            expect(mockChatService.getChatDetails).not.toHaveBeenCalled();

            expectNextError(next, res);

            expect(mockChatService.createChat).toHaveBeenCalledWith(req.user!.id, req.body.memberIds, req.body.name)
        });

        it("should pass service errors to next if getChatDetails failed", async () => {
            mockChatService.createChat.mockResolvedValue(chat);
            mockChatService.getChatDetails.mockRejectedValue(genericError);

            await chatController.createChat(req, res, next);

            expectNextError(next, res);

            expect(mockChatService.createChat).toHaveBeenCalledWith(req.user!.id, req.body.memberIds, req.body.name)

            expect(mockChatService.getChatDetails).toHaveBeenCalledWith(chat.id, req.user!.id);
        });
    });

    describe("getChatDetails", () => {
        let chat: Chat;
        let members: ChatMember[];
        let messages: Message[];

        beforeEach(() => {
            chat = createChat();
            members = createChatMembers(ChatType.GROUP, 3);
            messages = createMessages(MessageType.TEXT, 4, { chatId: chat.id, senderId: members[0]!.userId });
            req.params = { chatId: chat.id };
        });

        testRequiresUser(chatController.createChat);

        it("should return the chat, members, and messages", async () => {
            const resolvedValue = { chat, members, messages };
            
            mockChatService.getChatDetails.mockResolvedValue(resolvedValue);

            await chatController.getChatDetails(req, res, next);

            expectSuccess(
                mockChatService.getChatDetails,
                [chat.id, req.user!.id],
                res
            );

            const expectedResponse = JSON.parse(JSON.stringify(resolvedValue));
            expect(res._getJSONData()).toEqual(expectedResponse);
        });

        it("should pass service errors to next", async () => {
            mockChatService.getChatDetails.mockRejectedValue(genericError);

            await chatController.getChatDetails(req, res, next);

            expectNextError(next, res);

            expect(mockChatService.getChatDetails).toHaveBeenCalledWith(chat.id, req.user!.id);
        });
    });

    describe("updateChatName", () => {
        beforeEach(() => {
            req.method = "PATCH";
            req.params = { chatId: TEST_CHAT_ID };
            req.body = { name: "New group name" };
        });

        testRequiresUser(chatController.updateChatName);

        it("should update the chat's name", async () => {
            mockChatService.modifyChatGroup.mockResolvedValue(undefined);

            await chatController.updateChatName(req, res, next);

            expectStatus204(res);

            expect(mockChatService.modifyChatGroup).toHaveBeenCalledWith(TEST_CHAT_ID, req.user!.id, { name: req.body.name });
        });

        it("should pass service errors to next", async () => {
            mockChatService.modifyChatGroup.mockRejectedValue(genericError);

            await chatController.updateChatName(req, res, next);

            expectNextError(next, res);

            expect(mockChatService.modifyChatGroup).toHaveBeenCalledWith(TEST_CHAT_ID, req.user!.id, { name: req.body.name });

        });
    });

    describe("updateChatIcon", () => {
        beforeEach(() => {
            req.method = "POST";
            req.params = { chatId: TEST_CHAT_ID };
        });

        testRequiresUser(chatController.updateChatIcon);

        testRequiresFile(chatController.updateChatIcon);

        it("should handle a successful upload", async () => {
            req.file = createMockFile();

            uploadSpy.mockResolvedValue(TEST_GROUP_IMAGE_URL);            
            mockChatService.modifyChatGroup.mockResolvedValue(undefined);

            await chatController.updateChatIcon(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expectStatus204(res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.CHAT
            );

            expect(mockChatService.modifyChatGroup).toHaveBeenCalledWith(
                req.params.chatId,
                req.user!.id,
                { imageUrl: TEST_GROUP_IMAGE_URL }
            );
        });

        it("should handle a failed upload", async () => {
            req.file = createMockFile();
            
            uploadSpy.mockRejectedValue(genericError);
            
            await chatController.updateChatIcon(req, res, next);

            expectNextError(next, res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.CHAT
            );

            expect(mockChatService.modifyChatGroup).not.toHaveBeenCalled();
        });

        it("should pass chat service errors to next", async () => {
            req.file = createMockFile();

            uploadSpy.mockResolvedValue(TEST_GROUP_IMAGE_URL);
            mockChatService.modifyChatGroup.mockRejectedValue(genericError);

            await chatController.updateChatIcon(req, res, next);

            expectNextError(next, res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.CHAT
            );

            expect(mockChatService.modifyChatGroup).toHaveBeenCalledWith(
                req.params.chatId,
                req.user!.id,
                { imageUrl: TEST_GROUP_IMAGE_URL }
            );
        });
    });
});