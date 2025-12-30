import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { type Response } from "express";
import { createRequest, createResponse, type MockResponse } from "node-mocks-http";
import { AuthController } from "../../../../../src/modules/auth/auth.controller.js";
import { EndpointError } from "../../../../../src/common/errors/EndpointError.js";
import { UserStatus } from "../../../../../src/modules/users/user.types.js";
import { mockAuthService, mockProfileService, mockTokenService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createTestUser, TEST_EMAIL, TEST_PASSWORD, TEST_USER_ID, TEST_USERNAME } from "../../../fixtures/user.fixture.js";
import type { ProtectedRequest } from '../../../../../src/common/types/express.types.js';

describe("AuthController", () => {
    let authController: AuthController;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        // Inject Fake Service into the Real Controller
        authController = new AuthController(
            mockAuthService,
            mockProfileService,
            mockTokenService
        );

        res = createResponse();
        next = jest.fn();
    });

    describe("register", () => {
        it("should return status 201, user id, and username", async () => {
            const req = createRequest({
                method: "POST",
                body: {
                    username: TEST_USERNAME,
                    email: TEST_EMAIL,
                    password: TEST_PASSWORD,
                }
            });

            const mockResult = createTestUser();

            mockAuthService.register.mockResolvedValue(mockResult);

            await authController.register(req, res, next);

            expect(mockAuthService.register).toHaveBeenCalledWith(
                TEST_USERNAME,
                TEST_EMAIL,
                TEST_PASSWORD
            );

            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockResult);
        });

        it("should set accessToken and refreshToken cookies on successful registration", async () => {});
    });

    describe("login", () => {
        it("should return status 200, user id, and username", async () => {
            const req = createRequest({
                method: "POST",
                user: createTestUser(),
                body: {
                    username: TEST_USERNAME,
                    password: TEST_PASSWORD,
                }
            }) as ProtectedRequest;

            // FIX: The login method in the controller is not supposed to call validateUser at all.
            // Expect other function calls.

            // const mockResult = createTestUser();

            // mockAuthService.validateUser.mockResolvedValue(mockResult);

            // await authController.login(req, res, next);

            // expect(mockAuthService.validateUser).toHaveBeenCalledWith(
            //     TEST_USERNAME,
            //     TEST_PASSWORD
            // );
            // expect(res.statusCode).toBe(200);
            // expect(res._getJSONData()).toEqual(mockResult);
        });

        it("should call next(err) if service throws an error", async () => {
            const req = createRequest({
                body: { content: "Hi" },
            }) as ProtectedRequest;
            const res = createResponse();
            const next = jest.fn();

            // Simulate Service Failure
            const error = new EndpointError(403, "Not allowed");
            mockAuthService.validateUser.mockRejectedValue(error);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("logout", () => {
        it("should return 204", async () => {
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken: "refresh_token",
                },
            });
            const res = createResponse();
            const next = jest.fn();

            await authController.logout(req, res, next);

            expect(mockTokenService.removeToken).toHaveBeenCalledWith({
                refreshToken: "refresh_token",
            });

            expect(res.statusCode).toBe(204);
        });
    });

    describe("refreshTokens", () => {
        it("should return 204", async () => {});
    });

    describe("updateUsername", () => {
        it("should return 204", async () => {});
    });

    describe("updatePassword", () => {
        it("should return 204", async () => {});
    });

    describe("updateEmail", () => {
        it("should return 204", async () => {});
    });

    describe("deleteUser", () => {
        it("should return 204", async () => {});
    });
});
