import { expect } from "@jest/globals";
import type { Response } from "express";
import type { MockResponse, ResponseCookie } from "node-mocks-http";
import type { Tokens } from "../../src/modules/auth/tokens/token.types.js";
import { TEST_TOKENS } from "../fixtures/user.fixture.js";

type TokenType = "accessToken" | "refreshToken";

export const expectTokens = (cookies: Record<string, ResponseCookie>, tokens: Tokens = TEST_TOKENS) => {
    expect(cookies.accessToken?.value).toBe(tokens.accessToken);
    expect(cookies.refreshToken?.value).toBe(tokens.refreshToken);
}

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
}