import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { Response } from "express";
import { createRequest, createResponse, type MockRequest, type MockResponse } from "node-mocks-http";
import { ProfileController } from "../../../../../src/modules/users/profiles/profile.controller.js";
import { mockProfileService, resetServiceMocks } from "../../../../mocks/services.mock.js";
import { createProfileResponse, createTestUser, OTHER_USER_ID, TEST_IMAGE_URL, UPDATED_BIO, UPDATED_DISPLAY_NAME } from "../../../../fixtures/user.fixture.js";
import { expectNextError, expectStatus204, expectSuccess, genericError, testRequiresFile, testRequiresUser } from "../../../../utils/testHelpers.js";
import type { TypedRequest } from "../../../../../src/common/types/express.types.js";
import { createMockFile } from "../../../../utils/file.factory.js";
import type { UserParamsDto } from "../../../../../src/common/params/params.dto.js";
import { ImageFolder } from "../../../../../src/common/types/common.js";
import uploadUtils from "../../../../../src/common/utils/upload.utils.js";

describe("ProfileController", () => {
    const profileController = new ProfileController(
        mockProfileService
    );

    let uploadSpy: any;
    let req: MockRequest<TypedRequest<UserParamsDto>>;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        req = createRequest({
            user: createTestUser()
        });
        res = createResponse();
        next = jest.fn();

        uploadSpy = jest.spyOn(uploadUtils, "uploadToCloudinary");
    });

    afterEach(() => {
        // Restore original function after each test
        jest.restoreAllMocks();
    });

    describe("getMyProfile", () => {
        testRequiresUser(profileController.getMyProfile);

        it("should return 200 and full profile of the user that is logged in",  async () => {
            const profileResponse = createProfileResponse();

            mockProfileService.getProfile.mockResolvedValue(profileResponse);

            expect(next).not.toHaveBeenCalled();

            await profileController.getMyProfile(req, res, next);

            expectSuccess(mockProfileService.getProfile, [req.user!.id], res);

            expect(res._getJSONData()).toEqual(profileResponse);
        });

        it("should pass service errors to next", async () => {
            mockProfileService.getProfile.mockRejectedValue(genericError);

            await profileController.getMyProfile(req, res, next);

            expect(mockProfileService.getProfile).toHaveBeenCalledWith(req.user!.id);

            expectNextError(next, res);
        });
    });

    describe("getUserProfile", () => {
        beforeEach(() => {
            req.params = { userId: OTHER_USER_ID };
        });

        testRequiresUser(profileController.getUserProfile);

        it("should return 200 and full profile of another user", async () => {
            const profileResponse = createProfileResponse({ id: OTHER_USER_ID });
            req.params = { userId: OTHER_USER_ID };

            mockProfileService.getProfile.mockResolvedValue(profileResponse);

            await profileController.getUserProfile(req, res, next);

            expect(next).not.toHaveBeenCalled();

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
        beforeEach(() => {
            req.method = "PATCH";
        });

        testRequiresUser(profileController.modifyProfile);

        it("should return 204 No Content when new bio and display name are provided", async () => {
            req.body = {
                newBio: UPDATED_BIO,
                newDisplayName: UPDATED_DISPLAY_NAME
            };

            mockProfileService.modifyProfile.mockResolvedValue(undefined);

            await profileController.modifyProfile(req, res ,next);

            expect(next).not.toHaveBeenCalled();

            expectStatus204(res);

            expect(mockProfileService.modifyProfile).toHaveBeenCalledWith(req.user!.id, {
                bio: UPDATED_BIO,
                displayName: UPDATED_DISPLAY_NAME
            });
        });

        it("should return 204 No Content when an empty body object is provided", async () => {
            req.body = {};

            mockProfileService.modifyProfile.mockResolvedValue(undefined);

            expect(next).not.toHaveBeenCalled();

            await profileController.modifyProfile(req, res ,next);

            expectStatus204(res);

            expect(mockProfileService.modifyProfile).toHaveBeenCalledWith(req.user!.id, {});
        });

        it("should pass service errors to next", async () => {
            req.body = {
                newBio: UPDATED_BIO,
                newDisplayName: UPDATED_DISPLAY_NAME
            };

            mockProfileService.modifyProfile.mockRejectedValue(genericError);

            await profileController.modifyProfile(req, res, next);

            expectNextError(next, res);

            expect(mockProfileService.modifyProfile).toHaveBeenCalledWith(req.user!.id, {
                bio: UPDATED_BIO,
                displayName: UPDATED_DISPLAY_NAME
            });
        });
    });

    describe("updateProfilePicture", () => {
        beforeEach(() => {
            req.method = "POST";
        });

        testRequiresUser(profileController.updateProfilePicture);
        
        testRequiresFile(profileController.updateProfilePicture);

        it("should handle a successful upload", async () => {
            req.file = createMockFile();

            uploadSpy.mockResolvedValue(TEST_IMAGE_URL);
            mockProfileService.modifyProfile.mockResolvedValue(undefined);

            await profileController.updateProfilePicture(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expectStatus204(res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.USER
            );

            expect(mockProfileService.modifyProfile).toHaveBeenCalledWith(
                req.user!.id,
                { imageUrl: TEST_IMAGE_URL }
            );
        });

        it("should handle a failed upload", async () => {
            req.file = createMockFile();

            uploadSpy.mockRejectedValue(genericError);
            
            await profileController.updateProfilePicture(req, res, next);

            expectNextError(next, res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.USER
            );

            expect(mockProfileService.modifyProfile).not.toHaveBeenCalled();
        });

        it("should pass profile service errors to next", async () => {
            req.file = createMockFile();

            uploadSpy.mockResolvedValue(TEST_IMAGE_URL);
            mockProfileService.modifyProfile.mockRejectedValue(genericError);

            await profileController.updateProfilePicture(req, res, next);

            expectNextError(next, res);

            expect(uploadSpy).toHaveBeenCalledWith(
                req.file.buffer,
                ImageFolder.USER
            );

            expect(mockProfileService.modifyProfile).toHaveBeenCalledWith(
                req.user!.id,
                { imageUrl: TEST_IMAGE_URL }
            );
        });
    });
});