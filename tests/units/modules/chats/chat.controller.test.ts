import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";
import { ChatController } from "../../../../src/modules/chats/chat.controller.js";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { mockChatService, resetServiceMocks } from "../../../mocks/services.mock.js";
import type { User } from "../../../../src/modules/users/user.entity.js";
import { createTestUser } from "../../../fixtures/user.fixture.js";

describe("ChatController", () => {
    let chatController: ChatController;
    let req: MockRequest<Request>;
    let res: MockResponse<Response>;
    let next: jest.Mock;
    let mockUser: User;

    beforeEach(() => {
        resetServiceMocks();

        chatController = new ChatController(
            mockChatService
        );
        
        mockUser = createTestUser();
        req = createRequest({
            user: mockUser
        });
        res = createResponse();
        next = jest.fn();
    });

    describe("", () => {
        it("", () => {

        });
    });
});