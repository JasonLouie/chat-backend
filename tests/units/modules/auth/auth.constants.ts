import { TEST_EMAIL, TEST_PASSWORD, TEST_USERNAME } from "../../../fixtures/user.fixture.js";

export const AUTH_BODY = {
    REGISTER: {
        username: TEST_USERNAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD
    }
}