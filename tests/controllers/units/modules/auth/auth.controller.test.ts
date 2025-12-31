import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { createRequest, createResponse, type MockResponse, type ResponseCookie } from "node-mocks-http";
import { AuthController } from "../../../../../src/modules/auth/auth.controller.js";
import { EndpointError } from "../../../../../src/common/errors/EndpointError.js";
import { mockAuthService, mockProfileService, mockTokenService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createProfileResponse, createTestUser, TEST_EMAIL, TEST_PASSWORD, TEST_TOKENS, TEST_USER_ID, TEST_USERNAME } from "../../../fixtures/user.fixture.js";
import type { ProtectedRequest } from '../../../../../src/common/types/express.types.js';
import { AUTH_BODY } from './auth.constants.js';
import { expectClearedToken, expectStatus204 } from "../../../../utils/testHelpers.js";

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

            const mockUser = createTestUser();
            const mockProfileResponse = createProfileResponse();

            mockAuthService.register.mockResolvedValue(mockUser);
            mockTokenService.generateTokens.mockResolvedValue(TEST_TOKENS);
            mockProfileService.getProfile.mockResolvedValue(mockProfileResponse);

            await authController.register(req, res, next);

            expect(res.statusCode).toBe(201);

            expect(mockAuthService.register).toHaveBeenCalledWith(
                TEST_USERNAME,
                TEST_EMAIL,
                TEST_PASSWORD
            );

            expect(mockTokenService.generateTokens).toHaveBeenCalledWith(mockUser.id);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(mockUser.id);

            expect(res._getJSONData()).toEqual(expect.objectContaining({
                ...mockProfileResponse
            }));

            // Check cookies
            const cookies = res.cookies;

            expect(cookies.accessToken?.value).toBe(TEST_TOKENS.accessToken);
            expect(cookies.refreshToken?.value).toBe(TEST_TOKENS.refreshToken);
        });

        it("should pass the specific conflict error to next if registration fails", async () => {
            const req = createRequest({
                method: "POST",
                body: { ...AUTH_BODY.REGISTER }
            });

            const conflictError = new EndpointError(409, { email: [ "Email is already in use." ]});

            mockAuthService.register.mockRejectedValue(conflictError);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(conflictError);
        });

        it("should call next with error if token generation fails", async () => {
            const req = createRequest({
                method: "POST",
                body: { ...AUTH_BODY.REGISTER }
            });

            const mockUser = createTestUser();
            const mockProfileResponse = createProfileResponse();
            const serverError = new EndpointError(500, "Internal Server Configuration Error.");

            mockAuthService.register.mockResolvedValue(mockUser);
            mockTokenService.generateTokens.mockRejectedValue(serverError);
            mockProfileService.getProfile.mockResolvedValue(mockProfileResponse);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(serverError);

            expect(res.cookies).toEqual({});
        });

        it("should handle cases where the user's profile cannot be found", async () => {
            const req = createRequest({
                method: "POST",
                body: { ...AUTH_BODY.REGISTER }
            }) as ProtectedRequest;

            const mockUser = createTestUser();
            const notFoundError = new EndpointError(404, "Profile not found.");

            mockAuthService.register.mockResolvedValue(mockUser);
            mockTokenService.generateTokens.mockResolvedValue(TEST_TOKENS);
            mockProfileService.getProfile.mockRejectedValue(notFoundError);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(notFoundError);

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

            expect(cookies.accessToken?.value).toBe(TEST_TOKENS.accessToken);
            expect(cookies.refreshToken?.value).toBe(TEST_TOKENS.refreshToken);
        });

        it("should call next with error if token generation fails", async () => {
            const req = createRequest({
                method: "POST",
                user: createTestUser()
            }) as ProtectedRequest;

            const mockProfileResponse = createProfileResponse();
            const serverError = new EndpointError(500, "Internal Server Configuration Error.");
            
            mockTokenService.generateTokens.mockRejectedValue(serverError);
            mockProfileService.getProfile.mockResolvedValue(mockProfileResponse);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(serverError);

            expect(res.cookies).toEqual({});
        });

        it("should handle cases where the user's profile cannot be found", async () => {
            const req = createRequest({
                method: "POST",
                user: createTestUser()
            }) as ProtectedRequest;

            const notFoundError = new EndpointError(404, "Profile not found.");
            mockTokenService.generateTokens.mockResolvedValue(TEST_TOKENS);
            mockProfileService.getProfile.mockRejectedValue(notFoundError);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(notFoundError);

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

            // Check if access token is cleared
            expectClearedToken(cookies, "accessToken");

            // Check if refresh token is cleared
            expectClearedToken(cookies, "refreshToken");
        });

        it("should return 204 No Content and clear authentication cookies without any cookies", async () => {
            const req = createRequest({
                method: "POST"
            });

            await authController.logout(req, res, next);
            
            expectStatus204(res);

            expect(mockTokenService.removeToken).toHaveBeenCalledWith({});

            const cookies = res.cookies;

            // Check if access token is cleared
            expectClearedToken(cookies, "accessToken");

            // Check if refresh token is cleared
            expectClearedToken(cookies, "refreshToken");
        });

        it("should handle server error when logging out", async () => {
            const { refreshToken } = TEST_TOKENS;
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken
                }
            });

            const serverError = new EndpointError(500, "Server error during logout.");
            mockTokenService.removeToken.mockRejectedValue(serverError);

            await authController.logout(req, res, next);

            expect(mockTokenService.removeToken).toHaveBeenCalledWith({
                refreshToken
            });

            expect(next).toHaveBeenCalledWith(serverError);
        });

        it("should do nothing if the refresh token is not found in the DB (Stale Cookie)", async () => {
            const { refreshToken } = TEST_TOKENS;
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken
                }
            });

            
        });
    });

    describe("refreshTokens", () => {
        it("should return 204", async () => {});
    });
});
