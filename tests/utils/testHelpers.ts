import { jest, it, expect } from "@jest/globals";
import type { Request, Response } from "express";
import { createRequest, createResponse, type MockResponse, type ResponseCookie } from "node-mocks-http";
import type { Tokens } from "../../src/modules/auth/tokens/token.types.js";
import { TEST_TOKENS } from "../fixtures/user.fixture.js";

type TokenType = "accessToken" | "refreshToken";

export const genericError = new Error("Something went wrong!");

export const expectTokens = (cookies: Record<string, ResponseCookie>, tokens: Tokens = TEST_TOKENS) => {
    expect(cookies.accessToken?.value).toBe(tokens.accessToken);
    expect(cookies.refreshToken?.value).toBe(tokens.refreshToken);
};

export const expectClearedToken = (cookies: Record<string, ResponseCookie>, tokenType?: TokenType) => {
    const tokens = tokenType !== undefined ? [tokenType] : ["accessToken", "refreshToken"]; 
    tokens.forEach(tokenType => {
        expect(cookies).toHaveProperty(tokenType);
        expect(cookies[tokenType]!.value).toBe("");
        expect(cookies[tokenType]!.options.expires).toBeInstanceOf(Date);
        expect(cookies[tokenType]!.options.expires?.getTime()).toBeLessThan(Date.now());
    });
};

export const expectStatus204 = (res: MockResponse<Response>) => {
    expect(res.statusCode).toBe(204);
    
    expect(res._isEndCalled()).toBeTruthy();

    // Body is set to "No Content" internally in the mock
    expect(res._getData()).toBe("No Content");
};

export const expectNextError = (next: jest.Mock, res: MockResponse<Response>, expectedError: Error = genericError) => {
    expect(next).toHaveBeenCalledWith(expectedError);

    expect(res._isEndCalled()).toBeFalsy();
};

export const testRequiresUser = (
    controllerMethod: (req: Request<any, any, any, any>, res: MockResponse<Response>, next: jest.Mock) => Promise<void>
) => {
    it("should call next with 401 if req.user is missing", async () => {
        const req = createRequest();
        const res = createResponse();
        const next = jest.fn();

        await controllerMethod(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({ status: 401 })
        );
    });
}