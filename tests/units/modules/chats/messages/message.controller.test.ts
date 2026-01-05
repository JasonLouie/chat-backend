import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { Response } from "express";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { MessageController } from "../../../../../src/modules/chats/messages/message.controller.js";
import { EndpointError } from "../../../../../src/common/errors/EndpointError.js";
import { mockMessageService, resetServiceMocks } from "../../../../mocks/services.mock.js";
import { createTestUser } from "../../../../fixtures/user.fixture.js";
import { MessageType } from '../../../../../src/modules/chats/messages/message.types.js';
import { TEST_CHAT_ID } from "../../../../fixtures/chat.fixture.js";
import type { TypedRequest } from "../../../../../src/common/types/express.types.js";
import type { ChatParamsDto, MessageParamsDto } from "../../../../../src/common/params/params.dto.js";
import uploadUtils from "../../../../../src/common/utils/upload.utils.js";

describe("MessageController", () => {
    const messageController = new MessageController(mockMessageService);

    let uploadSpy: any;
    let req: MockRequest<TypedRequest<ChatParamsDto | MessageParamsDto>>;
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

    describe("searchMessages", () => {
        it("should return 200 and the list of messages on success", async () => {

        });

        
    });

    describe("sendMessage", () => {
        it("should return 201 and the new message on success", async () => {
            req.method = "POST";
            req.body = { content: "Hello World", type: MessageType.TEXT };

            // Mock the service return value
            const mockResult = { id: "msg-1", content: "Hello World" };
            mockMessageService.sendMessage.mockResolvedValue(mockResult as any);

            // Act
            await messageController.sendMessage(req, res, next);

            // Assert
            expect(mockMessageService.sendMessage).toHaveBeenCalledWith(
                TEST_CHAT_ID,
                req.user!.id,
                "Hello World",
                MessageType.TEXT
            );
            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockResult);
        });

        it("should call next(err) if service throws an error", async () => {
            req = createRequest({
                user: { id: "user-1" },
                params: { chatId: "chat-1" },
                body: { content: "Hi" }
            });
            const res = createResponse();
            const next = jest.fn();

            // Simulate Service Failure
            const error = new EndpointError(403, "Not allowed");
            mockMessageService.sendMessage.mockRejectedValue(error);
            
            await messageController.sendMessage(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});