import { Transform } from "class-transformer";
import { IsString, Length, Matches } from "class-validator";
import { ProfileRules } from "../modules/users/profiles/profile.rules.js";


export function IsValidDisplayName() {
    return function (object: Object, propertyName: string) {

        // Type Check
        IsString({
            message: "Display name must be a string."
        })(object, propertyName);

        // Lowercase the input before validation
        Transform(({ value }) => value?.toLowerCase().trim())(object, propertyName);

        Length(ProfileRules.DISPLAY_NAME.MIN_LENGTH, ProfileRules.DISPLAY_NAME.MAX_LENGTH, {
            message: `Display name must be between ${ProfileRules.DISPLAY_NAME.MIN_LENGTH} and ${ProfileRules.DISPLAY_NAME.MAX_LENGTH} characters.`
        });

        Matches(ProfileRules.DISPLAY_NAME.REGEX, {
            message: ProfileRules.DISPLAY_NAME.MESSAGE
        });
    }
}