import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export function IsValidTextMessage(optional = false) {
    return function (object: Object, propertyName: string) {
        
        IsString()(object, propertyName);

        MinLength(1, { message: "Message cannot be empty" })(object, propertyName);

        MaxLength(2000, { message: "Message is too long" })(object, propertyName);

        if (optional) {
            IsOptional()(object, propertyName);
        }
    }
}