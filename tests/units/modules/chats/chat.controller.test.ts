import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { Request, Response } from "express";
import { ChatController } from "../../../../src/modules/chats/chat.controller.js";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { mockChatService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createTestUser } from "../../../fixtures/user.fixture.js";
import uploadUtils from "../../../../src/common/utils/upload.utils.js";
import { testRequiresUser } from "../../../utils/testHelpers.js";

describe("ChatController", () => {
    const chatController = new ChatController(
        mockChatService
    );

    let uploadSpy: any;
    let req: MockRequest<Request>;
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
        testRequiresUser(chatController.getUserChats);

        it("should retrieve an array of all chats the user is in", () => {

        });
    });

    describe("createChat", () => {
        testRequiresUser(chatController.createChat);

        it("should return ", () => {

        });
    });

    describe("updateChatName", () => {
        testRequiresUser(chatController.updateChatName);

        it("should retrieve an array of all chats the user is in", () => {

        });
    });

    describe("updateChatIcon", () => {
        testRequiresUser(chatController.updateChatIcon);

        it("should retrieve an array of all chats the user is in", () => {

        });
    });
});