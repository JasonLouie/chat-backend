import { IsEnum } from "class-validator";
import { ChatRole } from "../chat.types.js";
import type { UUID } from "../../../common/types/common.js";
import { IsUUIDArray } from "../../../decorators/IsUUIDArray.js";

export class AddMembersDto {
    @IsUUIDArray("Must add at least 1 other person to the chat.")
    memberIds!: UUID[];
}

export class UpdateMemberDto {
    @IsEnum(ChatRole)
    role!: ChatRole;
}