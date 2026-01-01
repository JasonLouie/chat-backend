import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { UserController } from "../../../../src/modules/users/user.controller.js";
import { createRequest, createResponse, type MockResponse } from "node-mocks-http";
import { mockUserService, resetServiceMocks } from "../../../mocks/services.mock.js";
import type { ProtectedRequest } from "../../../../src/common/types/express.types.js";
import { createTestUser } from "../../../fixtures/user.fixture.js";
import { USER_BODY } from "./user.constants.js";
import { expectNextError, expectStatus204, genericError } from "../../../utils/testHelpers.js";

describe("UserController", () => {
    let userController: UserController;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        userController = new UserController(mockUserService);

        res = createResponse();
        next = jest.fn();
    });

    describe("getMe", () => {
        it("should return 200, id, username, and email", async () => {
            const mockUser = createTestUser(true);
            const req = createRequest({
                user: { id: mockUser.id }
            }) as ProtectedRequest;

            mockUserService.getUserFull.mockResolvedValue(mockUser);

            await userController.getMe(req, res, next);

            expect(res.statusCode).toBe(200);

            expect(mockUserService.getUserFull).toHaveBeenCalledWith(mockUser.id);

            expect(res._getJSONData()).toEqual(mockUser);
        });

        it("should call next with error if user is not found", async () => {
            const mockUser = createTestUser(true);
            const req = createRequest({
                user: { id: mockUser.id }
            }) as ProtectedRequest;

            mockUserService.getUserFull.mockRejectedValue(genericError);

            await userController.getMe(req, res, next);

            expect(mockUserService.getUserFull).toHaveBeenCalledWith(mockUser.id);

            expectNextError(next, res);
        });
    });

    describe("updateUsername", () => {
        it("should return 204 No Content", async () => {
            const mockUser = createTestUser();
            const { newUsername } = USER_BODY.USERNAME;
            const req = createRequest({
                method: "PATCH",
                body: { newUsername },
                user: mockUser
            }) as ProtectedRequest;

            mockUserService.updateUsername.mockResolvedValue(undefined);

            await userController.updateUsername(req, res, next);

            expectStatus204(res);

            expect(mockUserService.updateUsername).toHaveBeenCalledWith(mockUser.id, newUsername);
        });

        it("should pass service errors to next", async () => {
            const mockUser = createTestUser();
            const { newUsername } = USER_BODY.USERNAME;
            const req = createRequest({
                method: "PATCH",
                body: { newUsername },
                user: mockUser
            }) as ProtectedRequest;

            mockUserService.updateUsername.mockRejectedValue(genericError);

            await userController.updateUsername(req, res, next);

            expect(mockUserService.updateUsername).toHaveBeenCalledWith(mockUser.id, newUsername);
            
            expectNextError(next, res);
        });
    });

    describe("updatePassword", () => {
        it("should return 204 No Content", async () => {
            const req = createRequest({
                method: "PATCH",
                body: { ...USER_BODY.PASSWORD }
            }) as ProtectedRequest;
            const { oldPassword, newPassword } = USER_BODY.PASSWORD;

        });

        it("", async () => {

        });

        it("", async () => {

        });
    });

    describe("updateEmail", () => {
        it("should return 204 No Content", async () => {});
    });

    describe("deleteUser", () => {
        it("should return 204 No Content", async () => {});
    });
});