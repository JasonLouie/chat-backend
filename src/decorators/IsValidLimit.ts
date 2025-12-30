import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator"

export function IsValidLimit(optional = true) {
    return function (object: Object, propertyName: string) {
        Type(() => Number)(object, propertyName);
        IsInt()(object, propertyName);
        Min(1);
        Max(100);

        if (optional) {
            IsOptional()(object, propertyName);
        }
    }
}