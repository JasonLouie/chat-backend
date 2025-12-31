import { EndpointError } from "../errors/EndpointError.js";
import type { Request, Response, NextFunction } from "express";
import type { FormattedErrors as Errors } from "../errors/errors.types.js";

export function handleServerErrors(err: Error | EndpointError, req: Request, res: Response, next: NextFunction) {
    // Format TypeORM errors
    const errors: Errors = {};

    // Send TypeORM errors
    if (Object.keys(errors).length > 0) {
        res.status(400).json(new EndpointError(400, errors));
    } else if (err instanceof EndpointError) { // Send errors from custom EndpointError class
        res.status(err.status).json(err);
    } else { // Send unexpected errors
        res.status(500).json(new EndpointError(500, err.message || "Unspecified server error occurred."));
    }
}