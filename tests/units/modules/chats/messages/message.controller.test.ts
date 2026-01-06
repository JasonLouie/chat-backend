import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { Response } from "express";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { MessageController } from "../../../../../src/modules/chats/messages/message.controller.js";
import { EndpointError } from "../../../../../src/common/errors/EndpointError.js";
import { mockMessageService, resetServiceMocks } from "../../../../mocks/services.mock.js";
import { createTestUser } from "../../../../fixtures/user.fixture.js";
import { MessageType } from '../../../../../src/modules/chats/messages/message.types.js';
import { createMessages, TEST_CHAT_ID, TEST_MESSAGE_IMAGE_URL } from "../../../../fixtures/chat.fixture.js";
import type { TypedRequest } from "../../../../../src/common/types/express.types.js";
import type { MessageParamsDto } from "../../../../../src/common/params/params.dto.js";
import uploadUtils from "../../../../../src/common/utils/upload.utils.js";
import { expectNextError, expectStatus204, expectSuccess, genericError, testRequiresFile, testRequiresUser } from "../../../../utils/testHelpers.js";
import type { Message } from "../../../../../src/modules/chats/messages/message.entity.js";
import { ImageFolder, type UUID } from "../../../../../src/common/types/common.js";
import { createMockFile } from "../../../../utils/file.factory.js";

describe("MessageController", () => {
    const messageController = new MessageController(mockMessageService);

    let uploadSpy: any;
    let req: MockRequest<TypedRequest<MessageParamsDto>>;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        req = createRequest({
            user: createTestUser(),
            params: {
                chatId: TEST_CHAT_ID
            }
        });
        res = createResponse();
        next = jest.fn();

        uploadSpy = jest.spyOn(uploadUtils, "uploadToCloudinary");
    });

    afterEach(() => {
        // Restore original function after each test
        jest.restoreAllMocks();
    });

    describe("getMessages", () => {
        let expectedArgs: [any, any, any];

        beforeEach(() => {
            req.query = {
                cursor: new Date(),
                limit: 30
            }

            expectedArgs = [req.params.chatId, req.user!.id, { beforeDate: req.query.cursor, limit: req.query.limit }];
        });

        testRequiresUser(messageController.getMessages);

        it("should return 200 and the list of messages on success", async () => {
            const messages = createMessages(
                MessageType.TEXT,
                2,
                {
                    chatId: req.params.chatId,
                    senderId: req.user!.id
                }
            );

            mockMessageService.searchMessages.mockResolvedValue(messages);

            await messageController.getMessages(req, res, next);

            expectSuccess(mockMessageService.searchMessages, expectedArgs, res);

            const expectedResponse = JSON.parse(JSON.stringify(messages));
            expect(res._getJSONData()).toEqual(expectedResponse);
        });

        it("should pass service errors to next", async () => {
            mockMessageService.searchMessages.mockRejectedValue(genericError);

            await messageController.getMessages(req, res, next);

            expectNextError(next, res);

            expect(mockMessageService.searchMessages).toHaveBeenCalledWith(...expectedArgs);
        });
    });

    describe("searchMessages", () => {
        let expectedArgs: [any, any, any];

        beforeEach(() => {
            req.query = {
                keyword: "t",
                type: MessageType.TEXT,
                beforeDate: new Date(),
                pinned: false
            }

            expectedArgs = [req.params.chatId, req.user!.id, req.query];
        });

        testRequiresUser(messageController.searchMessages);

        it("should return 200 and the list of messages on success", async () => {
            const messages = createMessages(
                MessageType.TEXT,
                2,
                {
                    chatId: req.params.chatId,
                    senderId: req.user!.id
                }
            );

            mockMessageService.searchMessages.mockResolvedValue(messages);

            await messageController.searchMessages(req, res, next);

            expectSuccess(mockMessageService.searchMessages, expectedArgs, res);

            const expectedResponse = JSON.parse(JSON.stringify(messages));
            expect(res._getJSONData()).toEqual(expectedResponse);
        });

        it("should pass service errors to next", async () => {
            mockMessageService.searchMessages.mockRejectedValue(genericError);

            await messageController.searchMessages(req, res, next);

            expectNextError(next, res);

            expect(mockMessageService.searchMessages).toHaveBeenCalledWith(...expectedArgs);
        });
    });

    describe("sendText", () => {
        let expectedArgs: [UUID, UUID, string, MessageType];

        beforeEach(() => {
            req.method = "POST";
            req.body = {
                content: "Some text message"
            };
            expectedArgs = [req.params.chatId, req.user!.id, req.body.content, MessageType.TEXT];
        });

        testRequiresUser(messageController.sendText);

        it("should return 201 and the new message on success", async () => {
            const [message] = createMessages(MessageType.TEXT, 1, { chatId: req.params.chatId, senderId: req.user!.id, content: req.body.content }) as [Message];
            
            mockMessageService.sendMessage.mockResolvedValue(message);

            await messageController.sendText(req, res, next);

            expectSuccess(mockMessageService.sendMessage, expectedArgs, res, 201);
            
            expect(res._getJSONData()).toEqual(JSON.parse(JSON.stringify(message)));
        });

        it("should pass service errors to next", async () => {
            mockMessageService.sendMessage.mockRejectedValue(genericError);
            
            await messageController.sendText(req, res, next);

            expectNextError(next, res);

            expect(mockMessageService.sendMessage).toHaveBeenCalledWith(...expectedArgs);
        });
    });

    describe("sendImage", () => {
        let expectedArgs: [UUID, UUID, string, MessageType];

        beforeEach(() => {
            req.method = "POST";
            expectedArgs = [req.params.chatId, req.user!.id, TEST_MESSAGE_IMAGE_URL, MessageType.IMAGE];
        });

        testRequiresUser(messageController.sendImage);

        testRequiresFile(messageController.sendImage);

        it("should handle a successful upload", async () => {
            req.file = createMockFile();
            const [message] = createMessages(MessageType.IMAGE, 1, { chatId: req.params.chatId, senderId: req.user!.id, content: TEST_MESSAGE_IMAGE_URL }) as [Message];

            uploadSpy.mockResolvedValue(TEST_MESSAGE_IMAGE_URL);
            mockMessageService.sendMessage.mockResolvedValue(message);

            await messageController.sendImage(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expectSuccess(mockMessageService.sendMessage, expectedArgs, res, 201);
            
            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.MESSAGE
            );
            
            expect(res._getJSONData()).toEqual(JSON.parse(JSON.stringify(message)));
        });

        it("should handle a failed upload", async () => {
            req.file = createMockFile();
            
            uploadSpy.mockRejectedValue(genericError);
            
            await messageController.sendImage(req, res, next);

            expectNextError(next, res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.MESSAGE
            );

            expect(mockMessageService.sendMessage).not.toHaveBeenCalled();
        });

        it("should pass message service errors to next", async () => {
            req.file = createMockFile();

            uploadSpy.mockResolvedValue(TEST_MESSAGE_IMAGE_URL);
            mockMessageService.sendMessage.mockRejectedValue(genericError);

            await messageController.sendImage(req, res, next);

            expectNextError(next, res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.MESSAGE
            );

            expect(mockMessageService.sendMessage).toHaveBeenCalledWith(...expectedArgs);
        });
    });

    describe("updateMessage", () => {
        let expectedArgs: [UUID, UUID, UUID, string];

        beforeEach(() => {      
            req.method = "PATCH";
            req.params.messageId = "message-id";
            req.body = {
                newContent: "New test message"
            };

            expectedArgs = [
                req.params.messageId,
                req.params.chatId,
                req.user!.id,
                req.body.newContent
            ];
        });

        testRequiresUser(messageController.updateMessage);

        it("should update a text message", async () => {
            mockMessageService.updateMessage.mockResolvedValue(undefined);

            await messageController.updateMessage(req, res, next);

            expectStatus204(res);

            expect(mockMessageService.updateMessage).toHaveBeenCalledWith(...expectedArgs);
        });

        it("should pass service errors to next", async () => {
            mockMessageService.updateMessage.mockRejectedValue(genericError);

            await messageController.updateMessage(req, res, next);

            expectNextError(next, res);

            expect(mockMessageService.updateMessage).toHaveBeenCalledWith(...expectedArgs);
        });
    });

    describe("pinMessage", () => {
        let expectedArgs: [UUID, UUID, UUID, boolean];

        beforeEach(() => {
            req.method = "PATCH";
            req.params.messageId = "message-id";
            req.body = {
                pinned: true
            };

            expectedArgs = [
                req.params.messageId,
                req.params.chatId,
                req.user!.id,
                req.body.pinned
            ];
        });

        testRequiresUser(messageController.pinMessage);

        it("should pin/unpin the message (depending on req.body)", async () => {
            mockMessageService.pinMessage.mockResolvedValue(undefined);

            await messageController.pinMessage(req, res, next);

            expectStatus204(res);

            expect(mockMessageService.pinMessage).toHaveBeenCalledWith(...expectedArgs);
        });

        it("should pass service errors to next", async () => {
            mockMessageService.pinMessage.mockRejectedValue(genericError);

            await messageController.pinMessage(req, res, next);

            expectNextError(next, res);

            expect(mockMessageService.pinMessage).toHaveBeenCalledWith(...expectedArgs);
        });
    });

    describe("deleteMessage", () => {
        let expectedArgs: [UUID, UUID, UUID];

        beforeEach(() => {
            req.method = "DELETE";
            req.params.messageId = "message-id";

            expectedArgs = [
                req.params.messageId,
                req.params.chatId,
                req.user!.id
            ];
        });

        testRequiresUser(messageController.deleteMessage);

        it("should delete a message", async () => {
            mockMessageService.deleteMessage.mockResolvedValue(undefined);

            await messageController.deleteMessage(req, res, next);

            expectStatus204(res);

            expect(mockMessageService.deleteMessage).toHaveBeenCalledWith(...expectedArgs);
        });

        it("should pass service errors to next", async () => {
            mockMessageService.deleteMessage.mockRejectedValue(genericError);

            await messageController.deleteMessage(req, res, next);

            expectNextError(next, res);

            expect(mockMessageService.deleteMessage).toHaveBeenCalledWith(...expectedArgs);
        });
    });
});