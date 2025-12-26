import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import type { User } from "../../modules/users/user.entity.js";
import { EndpointError } from "../../classes/EndpointError.js";
import type { AuthInfo } from "../../modules/auth/auth.types.js";

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", { session: false }, (err: any, user: User, info: AuthInfo) => {
        // Handle server errors (db is down)
        if (err) return res.status(500).json(new EndpointError(500, "Servers are down. Failed to authenticate user."));

        // Handle user not found or wrong password
        const msg = info instanceof Error ? info.message : info?.message || "Authentication failed.";
        if (!user) return res.status(401).json(new EndpointError(401, msg));


        // User is valid and found. Attach the user to req and move onto the next function
        req.user = user;
        next();
    })(req, res, next);
}

export function protect(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", { session: false }, (err: any, user: User, info: AuthInfo) => {
        // Handle server errors (db is down)
        if (err) return res.status(500).json(new EndpointError(500, "Servers are down. Failed to authenticate user."));

        // Handle token error messages
        if (info && info instanceof Error) {
            // Token expired
            if (info.name === "TokenExpiredError") {
                return res.status(401).json(new EndpointError(401, "Token expired", "TokenExpiredError"));
            }

            // No token included
            if (info.message === "No auth token") {
                return res.status(401).json(new EndpointError(401, "No auth token provided", "MissingTokenError"));
            }

            // Invalid or malformed token
            return res.status(401).json(new EndpointError(401, "Invalid token", "InvalidTokenError"));
        }
        
        // Valid access token, but no corresponding user entry
        if (!user) return res.status(401).json(new EndpointError(401, "User not found."));

        // User is valid and found. Attach the user to req and move onto the next function
        req.user = user;
        next();
    })(req, res, next);
}