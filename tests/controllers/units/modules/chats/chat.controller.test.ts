import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { ChatController } from "../../../../../src/modules/chats/chat.controller.js";
import { createResponse, type MockResponse } from "node-mocks-http";
import { mockChatService, resetServiceMocks } from "../../../mocks/services.mock.js";

describe("ChatController", () => {
    let chatController: ChatController;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        chatController = new ChatController(
            mockChatService
        );

        res = createResponse();
        next = jest.fn();
    });

    describe("", () => {
        it("", () => {

        });
    });
});