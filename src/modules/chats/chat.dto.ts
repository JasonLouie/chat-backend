import { IsOptional } from "class-validator";
import type { UUID } from "../../common/types/common.js";
import { IsValidGroupName } from "../../decorators/IsValidGroupName.js";
import { IsUUIDArray } from "../../decorators/IsUUIDArray.js";

export class CreateChatDto {
    @IsUUIDArray("A chat must include at least one other person.")
    memberIds!: UUID[];

    @IsOptional()
    @IsValidGroupName()
    name?: string;
}

export class UpdateChatNameDto {
    @IsValidGroupName()
    name!: string;
}