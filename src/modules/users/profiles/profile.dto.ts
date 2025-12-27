import { IsOptional, IsString, IsUUID } from "class-validator";
import { IsValidDisplayName } from "../../../decorators/IsValidDisplayName.js";
import type { UUID } from "../../../common/types/common.js";

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

export class GetUserProfileDto {
    @IsUUID("4")
    userId!: UUID;
}