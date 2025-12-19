import type { Request, Response, NextFunction } from "express";
import { EndpointError } from "../classes/EndpointError.js";
import { titleCase } from "typeorm/util/StringUtils.js";
import type { RegexValidator, Rules, ValidationErrors, Validations } from "../types/validate.js";

/**
 * Validates the request body based on the validations object provided
 */
function validate(validations: Validations, req: Request, res: Response, next: NextFunction) {
    const validationErrors: ValidationErrors = {};

    for (const field in validations) {
        const fieldName = titleCase(field);
        const rules: Rules = validations[field]!;
        const value: string | undefined = req.body[field];
        const errors: string[] = [];

        if (rules.required && !value) {
            errors.push(`${fieldName} is required.`);
        }

        // Handle multiple regex tests
        if (value && rules.regexes) {
            rules.regexes.forEach((r: RegexValidator) => {
                if (value && r.regex && !(r.regex.test(value))) {
                    errors.push(r.message);
                }
            });
        } else if (value && rules.regex && rules.message && !(rules.regex.test(value))) { // Handle a singular regex test
            errors.push(rules.message);
        }

        // Handle minLength tests
        if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`${fieldName} must be at least ${rules.minLength} characters.`);
        }

        // Handle exact value matches
        if (value && rules.match !== undefined) {
            // If confirmPassword is an empty string or password doesn't match confirm password
            if (!rules.match || value !== rules.match) errors.push(`Both ${field}s must match.`);
        }

        // 
        if (errors.length > 0) {
            validationErrors[field] = errors;
        }
    }

    if (Object.keys(validationErrors).length > 0) {
        console.log("Validation Error!");
        res.status(400).json(new EndpointError(400, validationErrors));
    } else {
        console.log("Validation passed!");
        next();
    }
}

const requiredRule = {
    required: true
};

const usernameRules = {
    regex: /^[a-zA-Z0-9_.]+$/,
    message: "Username can only contain letters, numbers, underscores, and periods.",
    required: true,
    minLength: 3
};

const emailRules = {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Invalid email format.",
    required: true
};

const passwordRules = {
    regexes: [
        {
            regex: /[a-z]/,
            message: "Must contain at least one lowercase letter."
        },
        {
            regex: /[A-Z]/,
            message: "Must contain at least one uppercase letter."
        },
        {
            regex: /\d/,
            message: "Must contain at least one number."
        },
        {
            regex: /^\S+$/,
            message: "Password cannot contain whitespace."
        }
    ],
    minLength: 8,
    required: true
};

const imageUrlRules = {
    
};

const bioRules = {

}

// Auth Validators
/**
 * Middleware that validates the request body when user registers
 */
export function validateRegistration(req: Request, res: Response, next: NextFunction) {
    const confirmPassword = req.body?.confirmPassword || "";
    const validations = {
        username: usernameRules,
        email: emailRules,
        password: {...passwordRules, match: confirmPassword}
    };
    validate(validations, req, res, next);
}

/**
 * Middleware that validates the request body when user logs in
 */
export function validateLogin(req: Request, res: Response, next: NextFunction) {
    const validations = {
        username: requiredRule,
        password: requiredRule
    };
    validate(validations, req, res, next);
}

/**
 * Middleware that validates the request body (new username) when user modifies their username
 */
export function validateModifyUsername(req: Request, res: Response, next: NextFunction) {
    const validations = {
        newUsername: usernameRules
    };
    validate(validations, req, res, next);
}

/**
 * Middleware that validates the request body (old and new password) when user modifies their password
 */
export function validateModifyPassword(req: Request, res: Response, next: NextFunction) {
    const validations = {
        oldPassword: requiredRule,
        newPassword: passwordRules
    };
    validate(validations, req, res, next);
}

/**
 * Middleware that validates the request body (new email and password) when user changes email
 */
export function validateModifyEmail(req: Request, res: Response, next: NextFunction) {
    const validations = {
        newEmail: emailRules,
        password: requiredRule
    };
    validate(validations, req, res, next);
}

// Profile Validators

export function validateModifyProfile(req: Request, res: Response, next: NextFunction) {
    const validations = {
        newImageUrl: imageUrlRules,
        newBio: bioRules
    }
    validate(validations, req, res, next);
}