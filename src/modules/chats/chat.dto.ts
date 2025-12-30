import { ArrayMinSize, IsArray, IsOptional, IsUUID } from "class-validator";
import type { UUID } from "../../common/types/common.js";
import { IsValidGroupName } from "../../decorators/IsValidGroupName.js";

export class CreateChatDto {
    @IsArray()
    @ArrayMinSize(1, { message: "A chat must include at least one other person." })
    @IsUUID("4", { each: true })
    memberIds!: UUID[];

    @IsOptional()
    @IsValidGroupName()
    name?: string;
}

export class UpdateChatNameDto {
    @IsValidGroupName()
    name?: string;
}