import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { ChatMemberController } from "../../../../../src/modules/chats/members/chat-member.controller.js";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { mockChatMemberService, resetServiceMocks } from "../../../../mocks/services.mock.js";
import type { User } from "../../../../../src/modules/users/user.entity.js";
import { createTestUser } from "../../../../fixtures/user.fixture.js";
import { TEST_CHAT_ID } from "../../../../fixtures/chat.fixture.js";
import type { TypedRequest } from "../../../../../src/common/types/express.types.js";
import type { ChatParamsDto, MemberParamsDto } from "../../../../../src/common/params/params.dto.js";

describe("ChatMemberController", () => {
    let chatMemberController: ChatMemberController;
    let req: MockRequest<TypedRequest<ChatParamsDto | MemberParamsDto>>;
    let res: MockResponse<Response>;
    let next: jest.Mock;
    let mockUser: User;

    beforeEach(() => {
        resetServiceMocks();

        chatMemberController = new ChatMemberController(
            mockChatMemberService
        );

        mockUser = createTestUser();
        req = createRequest({
            user: mockUser,
            params: {
                chatId: TEST_CHAT_ID
            }
        });
        res = createResponse();
        next = jest.fn();
    });

    describe("", () => {
        it("", () => {

        });
    });
});