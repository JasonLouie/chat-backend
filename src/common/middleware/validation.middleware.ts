import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import type { FormattedErrors } from '../errors/errors.types.js';
import { EndpointError } from '../errors/EndpointError.js';

const formatErrors = (errors: ValidationError[]): FormattedErrors => {
    const formatted: FormattedErrors = {};

    errors.forEach(err => {
        if (err.constraints) {
            formatted[err.property] = Object.values(err.constraints);
        }
    });
    return formatted;
}

/**
 * @param type - The DTO class to validate against
 * @param value - The property of req to validate ('body', 'query', 'params'). Default: 'body'
 * @param skipMissingProperties - If true, ignores fields missing from the DTO (useful for PATCH)
 */
export function validationMiddleware<T>(
    type: any,
    value: "body" | "query" | "params" = "body",
    skipMissingProperties = false
): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Transform raw JSON/string into DTO instance
        const object = plainToInstance(type, req[value]);

        // Validate the DTO
        const errors = await validate(object, { skipMissingProperties, whitelist: true, forbidNonWhitelisted: true });

        // Check for errors
        if (errors.length > 0) {
            const message = errors.map((error: ValidationError) =>
                Object.values(error.constraints || {})
            ).join(", ");
            res.status(400).json(new EndpointError(400, formatErrors(errors)));
            return;
        }

        req[value] = object;
        next();
    }
}