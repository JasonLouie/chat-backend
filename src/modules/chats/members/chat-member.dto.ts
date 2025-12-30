import { IsEnum } from "class-validator";
import { ChatRole } from "../chat.types.js";

export class UpdateMemberDto {
    @IsEnum(ChatRole)
    role!: ChatRole;
}