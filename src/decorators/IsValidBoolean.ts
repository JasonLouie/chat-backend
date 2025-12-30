import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export function IsValidBoolean(optional = true) {
    return function (object: Object, propertyName: string) {
        
        Transform(({ value }) => {
            if (value === "true") return true;
            if (value === "false") return false;
            return value;
        })(object, propertyName);

        IsBoolean()(object, propertyName);

        if (optional) {
            IsOptional()(object, propertyName);
        }
    };
}
