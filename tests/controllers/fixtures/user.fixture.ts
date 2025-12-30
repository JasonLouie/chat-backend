import { Profile } from "../../../src/modules/users/profiles/profile.entity";
import { User } from "../../../src/modules/users/user.entity";

export const TEST_USERNAME = "testuser";
export const TEST_EMAIL = "test@example.com";
export const TEST_BIO = "A passionate software engineer.";
export const TEST_IMAGE_URL = "https://cloudinary.com/dummy.jpg";
export const TEST_USER_ID = "uuid-1234-5678";
export const TEST_DISPLAY_NAME = "Test User";

export const createTestUser = (overrides?: Partial<User>): User => {
    const profile = new Profile();
    profile.bio = TEST_BIO;
    profile.imageUrl = TEST_IMAGE_URL;
    profile.displayName = TEST_DISPLAY_NAME;

    const user = new User();
    user.id = TEST_USER_ID;
    user.username = TEST_USERNAME;
    user.email = TEST_EMAIL;
    user.profile = profile;
    
    return Object.assign(user, overrides);
}