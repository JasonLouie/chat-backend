import type { Request, Response, NextFunction } from "express";
import { EndpointError } from "../classes/EndpointError.js";
import { titleCase } from "typeorm/util/StringUtils.js";

interface RegexValidator {
    regex: RegExp,
    message: string
}

interface FlexibleData {
    [key: string]: any;
}

interface Errors {
    [key: string]: string[];
}

function validate(validations: FlexibleData, req: Request, res: Response, next: NextFunction) {
    const validationErrors: Errors = {};

    for (const field in validations) {
        const fieldName = titleCase(field);
        const rules = validations[field];
        const value = req.body[field];
        const errors = [];

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
        } else if (value && rules.regex && !rules.regex.test(value)) { // Handle a singular regex test
            errors.push(rules.message);
        }

        if (errors.length > 0) {
            validationErrors[field] = errors;
        }
    }
}

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

// AUTH AND USER VALIDATORS
export function validateSignUp(req: Request, res: Response, next: NextFunction) {
    const confirmPassword = req.body?.confirmPassword || "";
    const validations = {
        username: usernameRules,
        email: emailRules,
        password: {...passwordRules, match: confirmPassword}
    };
    validate(validations, req, res, next);
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
    const validations = {
        email: emailRules,
        password: passwordRules
    };
    validate(validations, req, res, next);
}

// Middleware for validating req body when modifying user
export function validateModifyUser(req: Request, res: Response, next: NextFunction) {
    const validations = {
        username: {...usernameRules, required: false}
    };
    validate(validations, req, res, next);
}

// Middleware for validing password before changing it
export function validatePassword(req: Request, res: Response, next: NextFunction) {
    const validations = {
        oldPassword: {required: true},
        newPassword: passwordRules
    };
    validate(validations, req, res, next);
}

// Middleware for validating email before changing it
export function validateEmail(req: Request, res: Response, next: NextFunction) {
    const validations = {
        newEmail: emailRules,
        password: {required: true}
    };
    validate(validations, req, res, next);
}