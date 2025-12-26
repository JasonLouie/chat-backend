import { IsEmail, IsString, Length } from 'class-validator';
import { UserRules } from "../modules/users/user.rules.js";
import { Transform } from 'class-transformer';

export function IsValidEmail() {
    return function (object: Object, propertyName: string) {
        
        // Type Check
        IsString({
            message: "Email must be a string."
        })(object, propertyName);

        // Lowercase the input before validation
        Transform(({ value }) => value?.toLowerCase().trim())(object, propertyName);

        IsEmail({}, { 
            message: UserRules.EMAIL.MESSAGE 
        })(object, propertyName);

        Length(UserRules.EMAIL.MIN_LENGTH, UserRules.EMAIL.MAX_LENGTH)(object, propertyName);
    };
}