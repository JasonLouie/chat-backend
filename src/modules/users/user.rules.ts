export const UserRules = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        REGEX: /^[a-zA-Z0-9_.]+$/,
        MESSAGE: 'Username can only contain letters, numbers, periods, and underscores.'
    },
    EMAIL: {
        MIN_LENGTH: 5,
        MAX_LENGTH: 254,
        MESSAGE: 'Provide a valid email address.'
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 64,
        LOWERCASE: {
            REGEX: /[a-z]/,
            MESSAGE: "Must contain at least one lowercase letter."
        },
        UPPERCASE: {
            REGEX: /[A-Z]/,
            MESSAGE: "Must contain at least one uppercase letter."
        },
        NUMBER: {
            REGEX: /[0-9]/,
            MESSAGE: "Must contain at least one number."
        },
        SPECIAL_CHARACTER: {
            REGEX: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            MESSAGE: "Must contain at least one special character."
        }
    }
}