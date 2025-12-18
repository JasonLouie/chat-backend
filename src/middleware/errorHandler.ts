import { EndpointError } from "../classes/EndpointError.js";
import type { Request, Response, NextFunction } from "express";

interface Errors {
    [key: string]: string[];
}

export function handleServerErrors(err: Error | EndpointError, req: Request, res: Response, next: NextFunction) {
    // Format TypeORM errors
    const errors: Errors = {};

    // TO-DO: Handle entity validation errors, unique errors, type cast errors, and possibly version errors (409)

    // Send TypeORM errors
    if (Object.keys(errors).length > 0) {
        res.status(400).json(new EndpointError(400, errors));
    } else if (err instanceof EndpointError) { // Send errors from custom EndpointError class
        res.status(err.status).json(err);
    } else { // Send unexpected errors
        res.status(500).json(new EndpointError(500, err.message || "Unspecified server error occurred."));
    }
}