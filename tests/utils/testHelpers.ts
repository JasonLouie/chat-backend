import { expect } from "@jest/globals";
import type { Response } from "express";
import type { MockResponse, ResponseCookie } from "node-mocks-http";

export const expectClearedToken = (cookies: Record<string, ResponseCookie>, tokenType: "accessToken" | "refreshToken") => {
    expect(cookies).toHaveProperty(tokenType);
    expect(cookies[tokenType]!.value).toBe("");
    expect(cookies[tokenType]!.options.expires).toBeInstanceOf(Date);
    expect(cookies[tokenType]!.options.expires?.getTime()).toBeLessThan(Date.now());
};

export const expectStatus204 = (res: MockResponse<Response>) => {
    expect(res.statusCode).toBe(204);
    
    expect(res._isEndCalled()).toBeTruthy();

    // Body is set to "No Content" internally in the mock
    expect(res._getData()).toBe("No Content");
}