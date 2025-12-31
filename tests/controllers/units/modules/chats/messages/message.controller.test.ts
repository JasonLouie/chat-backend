import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { createRequest, createResponse, type MockResponse } from "node-mocks-http";
import { MessageController } from "../../../../../../src/modules/chats/messages/message.controller.js";
import { EndpointError } from "../../../../../../src/common/errors/EndpointError.js";
import { type ProtectedRequest } from "../../../../../../src/common/types/express.types.js";
import { mockMessageService, resetServiceMocks } from "../../../../mocks/services.mock.js";
import { createTestUser } from "../../../../fixtures/user.fixture.js";
import { MessageType } from '../../../../../../src/modules/chats/messages/message.types.js';

describe("MessageController", () => {
    let messageController: MessageController;
    let req: Partial<ProtectedRequest>;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        // Inject Fake Service into the Real Controller
        messageController = new MessageController(mockMessageService);

        req = { params: {}, body: {}, user: createTestUser() };
        res = createResponse();
        next = jest.fn();
    });

    describe("searchMessages", () => {
        it("should return 200 and the list of messages on success", async () => {

        });

        
    });

    describe("sendMessage", () => {
        it("should return 201 and the new message on success", async () => {
            const req = createRequest({
                method: "POST",
                user: { id: "user-123" },
                params: { chatId: "chat-abc" },
                body: { content: "Hello World", type: MessageType.TEXT }
            }) as ProtectedRequest;
            const res = createResponse();
            const next = jest.fn();

            // Mock the service return value
            const mockResult = { id: "msg-1", content: "Hello World" };
            mockMessageService.sendMessage.mockResolvedValue(mockResult as any);

            // Act
            await messageController.sendMessage(req, res, next);

            // Assert
            expect(mockMessageService.sendMessage).toHaveBeenCalledWith(
                "chat-abc",
                "user-123",
                "Hello World",
                MessageType.TEXT
            );
            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockResult);
        });

        it("should call next(err) if service throws an error", async () => {
            const req = createRequest({
                user: { id: "user-1" },
                params: { chatId: "chat-1" },
                body: { content: "Hi" }
            }) as ProtectedRequest;
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