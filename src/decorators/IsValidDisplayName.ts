import { IsString, Length } from "class-validator";
import { ProfileRules } from "../modules/users/profiles/profile.rules.js";
import { Transform } from "class-transformer";

export function IsValidDisplayName() {
    return function (object: Object, propertyName: string) {

        // Type Check
        IsString({
            message: "Display name must be a string."
        })(object, propertyName);

        Transform(({ value }) => value?.trim())(object, propertyName);

        Length(ProfileRules.DISPLAY_NAME.MIN_LENGTH, ProfileRules.DISPLAY_NAME.MAX_LENGTH, {
            message: `Display name must be between ${ProfileRules.DISPLAY_NAME.MIN_LENGTH} and ${ProfileRules.DISPLAY_NAME.MAX_LENGTH} characters.`
        });
    }
}