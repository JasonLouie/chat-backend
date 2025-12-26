import { Transform } from "class-transformer";
import { IsString, Length, Matches } from "class-validator";
import { UserRules } from "../modules/users/user.rules.js";

export function IsValidUsername() {
    return function (object: Object, propertyName: string) {

        // Type Check
        IsString({
            message: "Username must be a string."
        })(object, propertyName);

        // Lowercase the input before validation
        Transform(({ value }) => value?.toLowerCase().trim())(object, propertyName);

        Length(UserRules.USERNAME.MIN_LENGTH, UserRules.USERNAME.MAX_LENGTH, {
            message: `Username must be between ${UserRules.USERNAME.MIN_LENGTH} and ${UserRules.USERNAME.MAX_LENGTH} characters.`
        });

        Matches(UserRules.USERNAME.REGEX, {
            message: UserRules.USERNAME.MESSAGE
        });
    }
}