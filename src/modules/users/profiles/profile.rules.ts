export const ProfileRules = {
    DISPLAY_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 30
    },
    BIO: {
        MAX_LENGTH: 160,
        MESSAGE: "Bio is too long. Maximum is 160 characters."
    }
}