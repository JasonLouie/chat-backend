import { IsOptional, IsString } from "class-validator";
import { IsValidDisplayName } from "../../../decorators/IsValidDisplayName.js";

export class ModifyProfileDto {
    @IsOptional()
    @IsValidDisplayName()
    displayName?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;
}