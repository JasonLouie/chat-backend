import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { ChatMemberController } from "../../../../../../src/modules/chats/members/chat-member.controller.js";
import { createResponse, type MockResponse } from "node-mocks-http";
import { mockChatMemberService, resetServiceMocks } from "../../../../mocks/services.mock.js";

describe("ChatMemberController", () => {
    let chatMemberController: ChatMemberController;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        chatMemberController = new ChatMemberController(
            mockChatMemberService
        );

        res = createResponse();
        next = jest.fn();
    });

    describe("", () => {
        it("", () => {

        });
    });
});