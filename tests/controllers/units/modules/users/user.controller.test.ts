import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { type Response } from "express";
import { UserController } from "../../../../../src/modules/users/user.controller.js";
import { createResponse, type MockResponse } from "node-mocks-http";
import { mockUserService, resetServiceMocks } from "../../../mocks/services.mock.js";

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

    describe("updateUsername", () => {
        it("should return 204", async () => {});

        it("", async () => {

        });
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