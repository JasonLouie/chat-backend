import { IsString, Matches, MaxLength, MinLength } from "class-validator";
import { UserRules } from "../modules/users/user.rules.js";

export function IsValidPassword() {
    return function (object: Object, propertyName: string) {

        // Type Check
        IsString({
            message: "Password must be a string."
        })(object, propertyName);

        // Length Rules
        MinLength(UserRules.PASSWORD.MIN_LENGTH, {
            message: `Password must be at least ${UserRules.PASSWORD.MIN_LENGTH} characters long.`
        })(object, propertyName);

        MaxLength(UserRules.PASSWORD.MAX_LENGTH, {
            message: `Password cannot exceed ${UserRules.PASSWORD.MAX_LENGTH} characters.`
        })(object, propertyName);

        // Complexity Rules

        // Lowercase
        Matches(UserRules.PASSWORD.LOWERCASE.REGEX, {
            message: UserRules.PASSWORD.LOWERCASE.MESSAGE
        })(object, propertyName);

        // Uppercase
        Matches(UserRules.PASSWORD.UPPERCASE.REGEX, {
            message: UserRules.PASSWORD.UPPERCASE.MESSAGE
        })(object, propertyName);

        // Numbers
        Matches(UserRules.PASSWORD.NUMBER.REGEX, {
            message: UserRules.PASSWORD.NUMBER.MESSAGE
        })(object, propertyName);

        // No Spaces
        Matches(UserRules.PASSWORD.NO_SPACES.REGEX, {
            message: UserRules.PASSWORD.NO_SPACES.MESSAGE
        })(object, propertyName);
    };
}