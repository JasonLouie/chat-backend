import { TEST_PASSWORD, UPDATED_EMAIL, UPDATED_PASSWORD, UPDATED_USERNAME } from "../../../fixtures/user.fixture.js";

export const USER_BODY = {
    USERNAME: {
        newUsername: UPDATED_USERNAME
    },
    EMAIL: {
        newEmail: UPDATED_EMAIL,
        password: TEST_PASSWORD
    },
    PASSWORD: {
        oldPassword: TEST_PASSWORD,
        newPassword: UPDATED_PASSWORD
    }
}