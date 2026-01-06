import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { MessageType } from "./message.types.js";
import { Type } from "class-transformer";
import { IsValidLimit } from "../../../decorators/IsValidLimit.js";
import { IsMessageType } from "../../../decorators/IsMessageType.js";
import { IsValidBoolean } from "../../../decorators/IsValidBoolean.js";
import { IsValidTextMessage } from "../../../decorators/IsValidTextMessage.js";

export class GetMessagesDto {
    @IsOptional()
    @Type(() => Date)
    cursor?: Date;

    @IsValidLimit()
    limit?: number;
}

export class SearchMessagesDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsMessageType()
    type?: MessageType;

    @IsOptional()
    @Type(() => Date)
    beforeDate?: Date;

    @IsOptional()
    @Type(() => Date)
    afterDate?: Date;

    @IsValidBoolean()
    pinned?: boolean;

    @IsValidLimit()
    limit?: number;
}

export class SendTextMessageDto {
    @IsValidTextMessage()
    content!: string;
}

export class UpdateMessageDto {
    @IsValidTextMessage()
    newContent!: string;
}

export class PinMessageDto {
    @IsValidBoolean(false)
    pinned!: boolean;
}