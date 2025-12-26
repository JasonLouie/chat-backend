import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * @param type - The DTO class to validate against
 * @param value - The property of req to validate ('body', 'query', 'params')
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
            res.status(400).json({ error: message});
            return;
        }

        req[value] = object;
        next();
    }
}