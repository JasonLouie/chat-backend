import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { createResponse, type MockResponse } from "node-mocks-http";
import { ProfileController } from "../../../../src/modules/users/profiles/profile.controller.js";
import { mockProfileService, resetServiceMocks } from "../../../mocks/services.mock.js";

describe("ProfileController", () => {
    let profileController: ProfileController;
    let res: MockResponse<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        resetServiceMocks();

        profileController = new ProfileController(
            mockProfileService
        );

        res = createResponse();
        next = jest.fn();
    });

    describe("", () => {
        it("", () => {

        });
    });
});