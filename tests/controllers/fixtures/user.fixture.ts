import { Profile } from "../../../src/modules/users/profiles/profile.entity.js";
import { User } from "../../../src/modules/users/user.entity.js";

export const TEST_USER_ID = "uuid-1234-5678";
export const TEST_USERNAME = "testuser";
export const TEST_EMAIL = "test@example.com";
export const TEST_PASSWORD = "TestPass1234!";
export const TEST_BIO = "A passionate software engineer.";
export const TEST_IMAGE_URL = "https://cloudinary.com/dummy.jpg";
export const TEST_DISPLAY_NAME = "Test User";

export const UPDATED_USERNAME = "newusername";
export const UPDATED_EMAIL = "new@example.com";
export const UPDATED_PASSWORD = "NewPass5678$";
export const UPDATED_BIO = "This is my new updated bio.";
export const UPDATED_DISPLAY_NAME = "New Cool Name";

export const createTestUser = (
    withEmail: boolean = false,
    withProfile: boolean = false,
    overrides?: Partial<User>
): User => {
    const user = new User();
    user.id = TEST_USER_ID;
    user.username = TEST_USERNAME;

    if (withEmail) {
        user.email = TEST_EMAIL;
    }

    if (withProfile) {
        const profile = new Profile();
        profile.bio = TEST_BIO;
        profile.imageUrl = TEST_IMAGE_URL;
        profile.displayName = TEST_DISPLAY_NAME;
        user.profile = profile;
    }

    return Object.assign(user, overrides);
};
