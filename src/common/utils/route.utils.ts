import type { RequestHandler, Response, NextFunction } from "express";
import type { ProtectedRequest } from "../types/express.types.js";

/**
 * Wraps controller method that expects a protected request and casts it to RequestHandler for Express
 */
export const handle = (
    fn: (
        req: ProtectedRequest<any, any, any, any>,
        res: Response,
        next: NextFunction
    ) => Promise<any>
): RequestHandler => {
    return fn as unknown as RequestHandler;
};
