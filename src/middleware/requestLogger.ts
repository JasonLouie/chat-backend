import type { Request, Response, NextFunction } from "express";

/**
 * Middleware that logs each request made to the server
 * @param req - Request
 * @param res - Response
 * @param next - Next
 */
export function logRequest(req: Request, res: Response, next: NextFunction) {
    console.log(`Request made: ${req.method} ${req.url} at ${new Date().toLocaleTimeString("en-US", { hour12: true, hour: "numeric", minute: "2-digit" } )}`);
    next();
}