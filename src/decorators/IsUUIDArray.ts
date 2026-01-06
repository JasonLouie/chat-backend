import { ArrayMinSize, IsArray, IsOptional, IsUUID } from "class-validator"

export function IsUUIDArray(message?: string, optional = false) {
    return function (object: Object, propertyName: string) {
        IsArray()(object, propertyName);
        ArrayMinSize(1, message ? { message } : undefined )(object, propertyName);
        IsUUID("4", { each: true })(object, propertyName);

        if (optional) {
            IsOptional()(object, propertyName);
        }
    }
}