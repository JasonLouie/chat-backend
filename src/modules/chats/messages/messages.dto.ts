import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { MessageType } from "../../../enums.js";
import { Transform, Type } from "class-transformer";

export class SearchMessagesDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsEnum(MessageType, { message: "Type must be text, image, or system" })
    type?: MessageType;

    @IsOptional()
    @Type(() => Date)
    beforeDate?: Date;

    @IsOptional()
    @Type(() => Date)
    afterDate?: Date;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
    })
    pinned?: boolean;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 30;
}