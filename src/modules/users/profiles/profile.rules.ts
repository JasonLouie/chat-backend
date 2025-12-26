export const ProfileRules = {
    DISPLAY_NAME: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 50,
        REGEX: /^[a-zA-Z0-9_. ]+$/,
        MESSAGE: 'Display name can only contain letters, numbers, spaces, periods, and underscores.'
    },
    BIO: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 50
    },
    IMAGE_URL: {

    },
}