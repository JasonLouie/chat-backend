import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";
import { UserController } from "../../../../src/modules/users/user.controller.js";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { mockUserService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createTestUser } from "../../../fixtures/user.fixture.js";
import { USER_BODY } from "./user.constants.js";
import { expectNextError, expectStatus204, genericError } from "../../../utils/testHelpers.js";
import type { User } from "../../../../src/modules/users/user.entity.js";

describe("UserController", () => {
    let userController: UserController;
    let req: MockRequest<Request>;
    let res: MockResponse<Response>;
    let next: jest.Mock;
    let mockUser: User;

    beforeEach(() => {
        resetServiceMocks();

        userController = new UserController(mockUserService);

        mockUser = createTestUser();
        req = createRequest({
            user: mockUser
        });
        res = createResponse();
        next = jest.fn();
    });

    describe("getMe", () => {
        it("should return 200, id, username, and email", async () => {
            mockUserService.getUserFull.mockResolvedValue(mockUser);

            await userController.getMe(req, res, next);

            expect(res.statusCode).toBe(200);

            expect(mockUserService.getUserFull).toHaveBeenCalledWith(mockUser.id);

            expect(res._getJSONData()).toEqual(mockUser);
        });

        it("should call next with error if user is not found", async () => {
            mockUserService.getUserFull.mockRejectedValue(genericError);

            await userController.getMe(req, res, next);

            expect(mockUserService.getUserFull).toHaveBeenCalledWith(mockUser.id);

            expectNextError(next, res);
        });
    });

    describe("updateUsername", () => {
        it("should return 204 No Content", async () => {
            const { newUsername } = USER_BODY.USERNAME;

            req.method = "PATCH";
            req.body = { newUsername };

            mockUserService.updateUsername.mockResolvedValue(undefined);

            await userController.updateUsername(req, res, next);

            expectStatus204(res);

            expect(mockUserService.updateUsername).toHaveBeenCalledWith(mockUser.id, newUsername);
        });

        it("should pass service errors to next", async () => {
            const { newUsername } = USER_BODY.USERNAME;
            
            req.method = "PATCH";
            req.body = {
                newUsername
            };

            mockUserService.updateUsername.mockRejectedValue(genericError);

            await userController.updateUsername(req, res, next);

            expect(mockUserService.updateUsername).toHaveBeenCalledWith(mockUser.id, newUsername);
            
            expectNextError(next, res);
        });
    });

    describe("updatePassword", () => {
        it("should return 204 No Content", async () => {
            const { oldPassword, newPassword } = USER_BODY.PASSWORD;
            
            req.method = "PATCH";
            req.body = {
                oldPassword,
                newPassword
            };

            mockUserService.updatePassword.mockResolvedValue(undefined);

            await userController.updatePassword(req, res, next);

            expectStatus204(res);

            expect(mockUserService.updatePassword).toHaveBeenCalledWith(mockUser.id, oldPassword, newPassword);
        });

        it("should pass service errors to next", async () => {
            const { oldPassword, newPassword } = USER_BODY.PASSWORD;

            req.method = "PATCH";
            req.body = {
                oldPassword,
                newPassword
            };

            mockUserService.updatePassword.mockRejectedValue(genericError);

            await userController.updatePassword(req, res, next);

            expect(mockUserService.updatePassword).toHaveBeenCalledWith(mockUser.id, oldPassword, newPassword);
            
            expectNextError(next, res);
        });
    });

    describe("updateEmail", () => {
        it("should return 204 No Content", async () => {
            const { newEmail, password } = USER_BODY.EMAIL;
            
            req.method = "PATCH";
            req.body = {
                newEmail,
                password
            };

            mockUserService.updateEmail.mockResolvedValue(undefined);

            await userController.updateEmail(req, res, next);

            expectStatus204(res);

            expect(mockUserService.updateEmail).toHaveBeenCalledWith(mockUser.id, newEmail, password);
        });

        it("should pass service errors to next", async () => {
            const { newEmail, password } = USER_BODY.EMAIL;

            req.method = "PATCH";
            req.body = {
                newEmail,
                password
            };

            mockUserService.updateEmail.mockRejectedValue(genericError);

            await userController.updateEmail(req, res, next);

            expect(mockUserService.updateEmail).toHaveBeenCalledWith(mockUser.id, newEmail, password);

            expectNextError(next, res);
        });
    });

    describe("deleteUser", () => {
        it("should return 204 No Content", async () => {
            req.method = "DELETE";

            mockUserService.deleteUser.mockResolvedValue(undefined);

            await userController.deleteUser(req, res, next);

            expectStatus204(res);

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockUser.id);
        });

        it("should pass service errors to next", async () => {
            req.method = "DELETE";

            mockUserService.deleteUser.mockRejectedValue(genericError);

            await userController.deleteUser(req, res, next);

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockUser.id);

            expectNextError(next, res);
        });
    });
});