import { IsUUID } from "class-validator";

export class UserParamsDto {
    @IsUUID("4")
    userId!: string;
}

export class ChatParamsDto {
    @IsUUID("4")
    chatId!: string;
}

export class MemberParamsDto {
    @IsUUID("4")
    chatId!: string;

    @IsUUID("4")
    memberId!: string;
}

export class MessageParamsDto {
    @IsUUID("4")
    chatId!: string;

    @IsUUID("4")
    messageId!: string;
}