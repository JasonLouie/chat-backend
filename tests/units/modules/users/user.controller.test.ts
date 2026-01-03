import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Response } from "express";
import { UserController } from "../../../../src/modules/users/user.controller.js";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { mockUserService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createTestUser } from "../../../fixtures/user.fixture.js";
import { USER_BODY } from "./user.constants.js";
import { expectNextError, expectStatus204, expectSuccess, genericError, testRequiresUser } from "../../../utils/testHelpers.js";
import type { User } from "../../../../src/modules/users/user.entity.js";
import type { TypedRequest } from "../../../../src/common/types/express.types.js";

describe("UserController", () => {
    const userController = new UserController(mockUserService);
    let req: MockRequest<TypedRequest>;
    let res: MockResponse<Response>;
    let next: jest.Mock;
    let mockUser: User;

    beforeEach(() => {
        resetServiceMocks();

        mockUser = createTestUser();
        req = createRequest({
            user: mockUser
        });
        res = createResponse();
        next = jest.fn();
    });

    describe("getMe", () => {
        testRequiresUser(userController.getMe);

        it("should return 200, id, username, and email", async () => {
            mockUserService.getUserFull.mockResolvedValue(mockUser);

            await userController.getMe(req, res, next);

            expectSuccess(mockUserService.getUserFull, [mockUser.id], res);

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
        const { newUsername } = USER_BODY.USERNAME;

        beforeEach(() => {
            req.method = "PATCH";
            req.body = { newUsername };
        });

        testRequiresUser(userController.updateUsername);

        it("should return 204 No Content", async () => {
            mockUserService.updateUsername.mockResolvedValue(undefined);

            await userController.updateUsername(req, res, next);

            expectStatus204(res);

            expect(mockUserService.updateUsername).toHaveBeenCalledWith(mockUser.id, newUsername);
        });

        it("should pass service errors to next", async () => {
            mockUserService.updateUsername.mockRejectedValue(genericError);

            await userController.updateUsername(req, res, next);

            expect(mockUserService.updateUsername).toHaveBeenCalledWith(mockUser.id, newUsername);
            
            expectNextError(next, res);
        });
    });

    describe("updatePassword", () => {
        const { oldPassword, newPassword } = USER_BODY.PASSWORD;

        beforeEach(() => {
            req.method = "PATCH";
            req.body = {
                oldPassword,
                newPassword
            };
        });

        testRequiresUser(userController.updatePassword);

        it("should return 204 No Content", async () => {
            mockUserService.updatePassword.mockResolvedValue(undefined);

            await userController.updatePassword(req, res, next);

            expectStatus204(res);

            expect(mockUserService.updatePassword).toHaveBeenCalledWith(mockUser.id, oldPassword, newPassword);
        });

        it("should pass service errors to next", async () => {
            mockUserService.updatePassword.mockRejectedValue(genericError);

            await userController.updatePassword(req, res, next);

            expect(mockUserService.updatePassword).toHaveBeenCalledWith(mockUser.id, oldPassword, newPassword);
            
            expectNextError(next, res);
        });
    });

    describe("updateEmail", () => {
        const { newEmail, password } = USER_BODY.EMAIL;

        beforeEach(() => {
            req.method = "PATCH";
            req.body = {
                newEmail,
                password
            };
        });

        testRequiresUser(userController.updateEmail);

        it("should return 204 No Content", async () => {
            mockUserService.updateEmail.mockResolvedValue(undefined);

            await userController.updateEmail(req, res, next);

            expectStatus204(res);

            expect(mockUserService.updateEmail).toHaveBeenCalledWith(mockUser.id, newEmail, password);
        });

        it("should pass service errors to next", async () => {
            mockUserService.updateEmail.mockRejectedValue(genericError);

            await userController.updateEmail(req, res, next);

            expect(mockUserService.updateEmail).toHaveBeenCalledWith(mockUser.id, newEmail, password);

            expectNextError(next, res);
        });
    });

    describe("deleteUser", () => {
        beforeEach(() => {
            req.method = "DELETE";
        });

        testRequiresUser(userController.deleteUser);

        it("should return 204 No Content", async () => {
            mockUserService.deleteUser.mockResolvedValue(undefined);

            await userController.deleteUser(req, res, next);

            expectStatus204(res);

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockUser.id);
        });

        it("should pass service errors to next", async () => {
            mockUserService.deleteUser.mockRejectedValue(genericError);

            await userController.deleteUser(req, res, next);

            expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockUser.id);

            expectNextError(next, res);
        });
    });
});