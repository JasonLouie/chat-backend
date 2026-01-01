import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { createRequest, createResponse, type MockResponse } from "node-mocks-http";
import { AuthController } from "../../../../src/modules/auth/auth.controller.js";
import { mockAuthService, mockProfileService, mockTokenService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createProfileResponse, createTestUser, OLD_TOKENS, TEST_TOKENS } from "../../../fixtures/user.fixture.js";
import type { ProtectedRequest } from '../../../../src/common/types/express.types.js';
import { AUTH_BODY } from './auth.constants.js';
import { expectClearedToken, expectNextError, expectStatus204, expectTokens, genericError } from "../../../utils/testHelpers.js";

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
        it("should register user, set cookies, and return full profile", async () => {
            const req = createRequest({
                method: "POST",
                body: { ...AUTH_BODY.REGISTER }
            });

            const { username, email, password } = AUTH_BODY.REGISTER;
            const mockUser = createTestUser();
            const mockProfileResponse = createProfileResponse();

            mockAuthService.register.mockResolvedValue(mockUser);
            mockTokenService.generateTokens.mockResolvedValue(TEST_TOKENS);
            mockProfileService.getProfile.mockResolvedValue(mockProfileResponse);

            await authController.register(req, res, next);

            expect(res.statusCode).toBe(201);

            expect(mockAuthService.register).toHaveBeenCalledWith(username, email, password);

            expect(mockTokenService.generateTokens).toHaveBeenCalledWith(mockUser.id);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(mockUser.id);

            expect(res._getJSONData()).toEqual(mockProfileResponse);

            // Check cookies
            const cookies = res.cookies;

            expectTokens(cookies);
        });

        it("should pass the error to next if registration fails", async () => {
            const req = createRequest({
                method: "POST",
                body: { ...AUTH_BODY.REGISTER }
            });

            mockAuthService.register.mockRejectedValue(genericError);

            await authController.register(req, res, next);

            expectNextError(next, res);
        });

        it("should call next with error if token generation fails", async () => {
            const req = createRequest({
                method: "POST",
                body: { ...AUTH_BODY.REGISTER }
            });

            const mockUser = createTestUser();
            const mockProfileResponse = createProfileResponse();

            mockAuthService.register.mockResolvedValue(mockUser);
            mockTokenService.generateTokens.mockRejectedValue(genericError);
            mockProfileService.getProfile.mockResolvedValue(mockProfileResponse);

            await authController.register(req, res, next);

            expectNextError(next, res);

            expect(res.cookies).toEqual({});
        });

        it("should handle cases where the user's profile cannot be found", async () => {
            const req = createRequest({
                method: "POST",
                body: { ...AUTH_BODY.REGISTER }
            }) as ProtectedRequest;

            const mockUser = createTestUser();

            mockAuthService.register.mockResolvedValue(mockUser);
            mockTokenService.generateTokens.mockResolvedValue(TEST_TOKENS);
            mockProfileService.getProfile.mockRejectedValue(genericError);

            await authController.register(req, res, next);

            expectNextError(next, res);

            expect(res.cookies).toEqual({});
        });
    });

    describe("login", () => {
        it("should set cookies and return full profile", async () => {
            const req = createRequest({
                method: "POST",
                user: createTestUser()
            }) as ProtectedRequest;

            const mockProfileResponse = createProfileResponse();

            mockTokenService.generateTokens.mockResolvedValue(TEST_TOKENS);
            mockProfileService.getProfile.mockResolvedValue(mockProfileResponse);

            await authController.login(req, res, next);

            expect(res.statusCode).toBe(200);

            expect(mockTokenService.generateTokens).toHaveBeenCalledWith(req.user.id);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(req.user.id);

            expect(res._getJSONData()).toEqual(expect.objectContaining({
                ...mockProfileResponse
            }));

            // Check cookies
            const cookies = res.cookies;

            expectTokens(cookies);
        });

        it("should call next with error if token generation fails", async () => {
            const req = createRequest({
                method: "POST",
                user: createTestUser()
            }) as ProtectedRequest;

            const mockProfileResponse = createProfileResponse();
            
            mockTokenService.generateTokens.mockRejectedValue(genericError);
            mockProfileService.getProfile.mockResolvedValue(mockProfileResponse);

            await authController.login(req, res, next);

            expectNextError(next, res);

            expect(res.cookies).toEqual({});
        });

        it("should handle cases where the user's profile cannot be found", async () => {
            const req = createRequest({
                method: "POST",
                user: createTestUser()
            }) as ProtectedRequest;

            mockTokenService.generateTokens.mockResolvedValue(TEST_TOKENS);
            mockProfileService.getProfile.mockRejectedValue(genericError);

            await authController.login(req, res, next);

            expectNextError(next, res);

            expect(res.cookies).toEqual({});
        });
    });

    describe("logout", () => {
        it("should return 204 No Content and clear authentication cookies", async () => {
            const { refreshToken } = TEST_TOKENS;
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken
                },
            });

            await authController.logout(req, res, next);
            
            expectStatus204(res);

            expect(mockTokenService.removeToken).toHaveBeenCalledWith({
                refreshToken
            });

            const cookies = res.cookies;

            // Check if access and refresh tokens are cleared
            expectClearedToken(cookies);
        });

        it("should return 204 No Content and clear authentication cookies without any cookies", async () => {
            const req = createRequest({
                method: "POST"
            });

            await authController.logout(req, res, next);
            
            expectStatus204(res);

            expect(mockTokenService.removeToken).toHaveBeenCalledWith({});

            const cookies = res.cookies;

            // Check if access and refresh tokens are cleared
            expectClearedToken(cookies);
        });

        it("should pass service errors to next", async () => {
            const { refreshToken } = TEST_TOKENS;
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken
                }
            });

            mockTokenService.removeToken.mockRejectedValue(genericError);

            await authController.logout(req, res, next);

            expect(mockTokenService.removeToken).toHaveBeenCalledWith({
                refreshToken
            });

            expectNextError(next, res);
        });

        it("should do nothing if the refresh token is not found in the DB (Stale Cookie)", async () => {
            const { refreshToken } = TEST_TOKENS;
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken
                }
            });

            mockTokenService.removeToken.mockResolvedValue(undefined);

            await authController.logout(req, res, next);

            expectStatus204(res);

            const cookies = res.cookies;

            // Check if access and refresh tokens are cleared
            expectClearedToken(cookies);
        });
    });

    describe("refreshTokens", () => {
        it("should return 204 No Content and set authentication cookies", async () => {
            const { refreshToken } = OLD_TOKENS;
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken
                }
            });

            mockTokenService.refresh.mockResolvedValue(TEST_TOKENS);

            await authController.refreshTokens(req, res, next);

            expectStatus204(res);

            expect(mockTokenService.refresh).toHaveBeenCalledWith({ refreshToken });

            // Check cookies
            const cookies = res.cookies;

            expectTokens(cookies);
        });

        it("should call next with error if there was a server error during token refresh", async () => {
            const { refreshToken } = OLD_TOKENS;
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken
                }
            });

            mockTokenService.refresh.mockRejectedValue(genericError);

            await authController.refreshTokens(req, res, next);

            expect(mockTokenService.refresh).toHaveBeenCalledWith({ refreshToken });

            expectNextError(next, res);
        });

        it("should call next with error if the refresh token is not in req.cookies", async () => {
            const req = createRequest({
                method: "POST",
                cookies: {}
            });

            mockTokenService.refresh.mockRejectedValue(genericError);

            await authController.refreshTokens(req, res, next);

            expect(mockTokenService.refresh).toHaveBeenCalledWith({});

            expectNextError(next, res);
        });
    });
});
