import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { ChatMemberController } from "../../../../../src/modules/chats/members/chat-member.controller.js";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { mockChatMemberService, resetServiceMocks } from "../../../../mocks/services.mock.js";
import { createTestUser, OTHER_USER_ID, TEST_USER_ID } from "../../../../fixtures/user.fixture.js";
import { createChatMembers, TEST_CHAT_ID } from "../../../../fixtures/chat.fixture.js";
import type { TypedRequest } from "../../../../../src/common/types/express.types.js";
import type { MemberParamsDto } from "../../../../../src/common/params/params.dto.js";
import { expectNextError, expectStatus204, expectSuccess, genericError, testRequiresUser } from "../../../../utils/testHelpers.js";
import type { ChatMember } from "../../../../../src/modules/chats/members/chat-member.entity.js";
import { ChatRole, ChatType } from "../../../../../src/modules/chats/chat.types.js";

describe("ChatMemberController", () => {
    const chatMemberController = new ChatMemberController(
        mockChatMemberService
    );
    let req: MockRequest<TypedRequest<MemberParamsDto>>;
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
    });

    describe("getMembers", () => {
        let members: ChatMember[];

        beforeEach(() => {
            members = createChatMembers(ChatType.GROUP, 3);
        });

        testRequiresUser(chatMemberController.getMembers);

        it("should return an array of all members in a chat", async () => {
            mockChatMemberService.getChatMembers.mockResolvedValue(members);

            await chatMemberController.getMembers(req, res, next);

            expectSuccess(
                mockChatMemberService.getChatMembers,
                [req.params.chatId, req.user!.id, false],
                res
            );

            const expectedResponse = JSON.parse(JSON.stringify(members));
            expect(res._getJSONData()).toEqual(expectedResponse);
        });

        it("should pass service errors to next", async () => {
            mockChatMemberService.getChatMembers.mockRejectedValue(genericError);

            await chatMemberController.getMembers(req, res, next);

            expectNextError(next, res);

            expect(mockChatMemberService.getChatMembers).toHaveBeenCalledWith(req.params.chatId, req.user!.id, false);
        });
    });

    describe("addMembers", () => {
        let members: ChatMember[];

        beforeEach(() => {
            members = createChatMembers(ChatType.GROUP, 3);

            req.method = "POST";
            req.body = {
                memberIds: members.map(m => m.userId)
            };
        });

        testRequiresUser(chatMemberController.addMembers);

        it("should allow adding new members to the group", async () => {
            mockChatMemberService.addMembers.mockResolvedValue(members);

            await chatMemberController.addMembers(req, res, next);

            expectSuccess(
                mockChatMemberService.addMembers,
                [req.params.chatId, req.user!.id, req.body.memberIds],
                res,
                201
            );

            const expectedResponse = JSON.parse(JSON.stringify(members));
            expect(res._getJSONData()).toEqual(expectedResponse);
        });

        it("should pass service errors to next", async () => {
            mockChatMemberService.addMembers.mockRejectedValue(genericError);

            await chatMemberController.addMembers(req, res, next);

            expectNextError(next, res);

            expect(mockChatMemberService.addMembers).toHaveBeenCalledWith(req.params.chatId, req.user!.id, req.body.memberIds);
        });
    });

    describe("updateMember", () => {
        beforeEach(() => {
            req.method = "PATCH";
            req.params = { ...req.params, memberId: OTHER_USER_ID }
        });

        testRequiresUser(chatMemberController.updateMember);

        it("should handle transferring ownership to another group member", async () => {
            req.body = {
                role: ChatRole.OWNER
            };

            mockChatMemberService.transferOwnership.mockResolvedValue(undefined);

            await chatMemberController.updateMember(req, res, next);

            expectStatus204(res);

            expect(mockChatMemberService.transferOwnership).toHaveBeenCalledWith(req.params.chatId, req.user!.id, req.params.memberId);
        });

        it("should pass service errors to next", async () => {
            req.body = {
                role: ChatRole.OWNER
            };
            
            mockChatMemberService.transferOwnership.mockRejectedValue(genericError);

            await chatMemberController.updateMember(req, res, next);

            expectNextError(next, res);

            expect(mockChatMemberService.transferOwnership).toHaveBeenCalledWith(req.params.chatId, req.user!.id, req.params.memberId);
        });

        it ("should throw a status 400 error if the role provided is member", async () => {
            req.body = {
                role: ChatRole.MEMBER
            };

            await chatMemberController.updateMember(req, res, next);

            expect(mockChatMemberService.transferOwnership).not.toHaveBeenCalled();

            expectNextError(next, res, expect.objectContaining({ status: 400 }));
        });
    });

    describe("deleteMember", () => {
        beforeEach(() => {
            req.method = "DELETE";
        });

        testRequiresUser(chatMemberController.deleteMember);

        it("should handle leaving a chat", async () => {
            req.params.memberId = TEST_USER_ID;

            mockChatMemberService.leaveChat.mockResolvedValue(undefined);

            await chatMemberController.deleteMember(req, res, next);

            expect(mockChatMemberService.removeMember).not.toHaveBeenCalled();

            expectStatus204(res);

            expect(mockChatMemberService.leaveChat).toHaveBeenCalledWith(req.params.chatId, req.user!.id);
        });

        it("should pass service errors when leaving a chat to next", async () => {
            req.params.memberId = TEST_USER_ID;

            mockChatMemberService.leaveChat.mockRejectedValue(genericError);

            await chatMemberController.deleteMember(req, res, next);

            expect(mockChatMemberService.removeMember).not.toHaveBeenCalled();

            expectNextError(next, res);

            expect(mockChatMemberService.leaveChat).toHaveBeenCalledWith(req.params.chatId, req.user!.id);
        });

        it("should handle removing a chat member", async () => {
            req.params.memberId = OTHER_USER_ID;

            mockChatMemberService.removeMember.mockResolvedValue(undefined);

            await chatMemberController.deleteMember(req, res, next);

            expect(mockChatMemberService.leaveChat).not.toHaveBeenCalled();

            expectStatus204(res);

            expect(mockChatMemberService.removeMember).toHaveBeenCalledWith(req.params.chatId, req.user!.id, req.params.memberId);
        });

        it("should pass service errors when removing a member from a chat to next", async () => {
            req.params.memberId = OTHER_USER_ID;

            mockChatMemberService.removeMember.mockRejectedValue(genericError);

            await chatMemberController.deleteMember(req, res, next);

            expect(mockChatMemberService.leaveChat).not.toHaveBeenCalled();

            expectNextError(next, res);

            expect(mockChatMemberService.removeMember).toHaveBeenCalledWith(req.params.chatId, req.user!.id, req.params.memberId);
        });
    });
});