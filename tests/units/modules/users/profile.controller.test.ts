import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { ProfileController } from "../../../../src/modules/users/profiles/profile.controller.js";
import { mockProfileService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createProfileResponse, createTestUser, OTHER_USER_ID } from "../../../fixtures/user.fixture.js";
import type { User } from "../../../../src/modules/users/user.entity.js";
import { testRequiresUser } from "../../../utils/testHelpers.js";

describe("ProfileController", () => {
    const profileController = new ProfileController(
        mockProfileService
    );
    let req: Request<any, any, any, any>;
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

    describe("getMyProfile", () => {
        testRequiresUser(profileController.getMyProfile);

        it("should return 200 and full profile",  async () => {
            const profileResponse = createProfileResponse();

            mockProfileService.getProfile.mockResolvedValue(profileResponse);

            await profileController.getMyProfile(req, res, next);

            expect(res.statusCode).toBe(200);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(mockUser.id);

            expect(res._getJSONData()).toEqual(profileResponse);
        });

        it("should pass service errors to next", async () => {

        });
    });

    describe("getUserProfile", () => {
        it("should return 200 and full profile", async () => {
            const profileResponse = createProfileResponse({ id: OTHER_USER_ID });
            req.params = { userId: OTHER_USER_ID };

            mockProfileService.getProfile.mockResolvedValue(profileResponse);

            await profileController.getUserProfile(req, res, next);

            expect(res.statusCode).toBe(200);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(OTHER_USER_ID);

            expect(res._getJSONData()).toEqual(profileResponse);
        });

        it("should pass service errors to next", async () => {

        });
    });

    describe("modifyProfile", () => {
        it("should return 204 No Content", async () => {

        });

        it("should pass service errors to next", async () => {

        });
    });

    describe("updateProfilePicture", () => {
        it("should return 204 No Content", async () => {

        });

        it("should pass service errors to next", async () => {

        });
    });
});