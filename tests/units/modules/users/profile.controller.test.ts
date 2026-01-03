import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Response } from "express";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { ProfileController } from "../../../../src/modules/users/profiles/profile.controller.js";
import { mockProfileService, resetServiceMocks } from "../../../mocks/services.mock.js";
import { createProfileResponse, createTestUser, OTHER_USER_ID } from "../../../fixtures/user.fixture.js";
import type { User } from "../../../../src/modules/users/user.entity.js";
import { expectNextError, expectSuccess, genericError, testRequiresUser } from "../../../utils/testHelpers.js";
import type { TypedRequest } from "../../../../src/common/types/express.types.js";

describe("ProfileController", () => {
    const profileController = new ProfileController(
        mockProfileService
    );
    let req: MockRequest<TypedRequest<any>>;
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

            expectSuccess(mockProfileService.getProfile, [mockUser.id], res);

            expect(res._getJSONData()).toEqual(profileResponse);
        });

        it("should pass service errors to next", async () => {
            mockProfileService.getProfile.mockRejectedValue(genericError);

            await profileController.getMyProfile(req, res, next);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(mockUser.id);

            expectNextError(next, res);
        });
    });

    describe("getUserProfile", () => {
        beforeEach(() => {
            req.params = { userId: OTHER_USER_ID };
        });

        testRequiresUser(profileController.getUserProfile);

        it("should return 200 and full profile", async () => {
            const profileResponse = createProfileResponse({ id: OTHER_USER_ID });
            req.params = { userId: OTHER_USER_ID };

            mockProfileService.getProfile.mockResolvedValue(profileResponse);

            await profileController.getUserProfile(req, res, next);

            expectSuccess(mockProfileService.getProfile, [OTHER_USER_ID], res);

            expect(res._getJSONData()).toEqual(profileResponse);
        });

        it("should pass service errors to next", async () => {
            mockProfileService.getProfile.mockRejectedValue(genericError);
            req.params = { userId: OTHER_USER_ID };

            await profileController.getUserProfile(req, res, next);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(OTHER_USER_ID);

            expectNextError(next, res);
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