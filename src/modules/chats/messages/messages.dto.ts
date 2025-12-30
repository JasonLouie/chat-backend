import { IsOptional, IsString } from "class-validator";
import { MessageType } from "./message.types.js";
import { Type } from "class-transformer";
import { IsValidLimit } from "../../../decorators/IsValidLimit.js";
import { IsMessageType } from "../../../decorators/IsMessageType.js";
import { IsValidBoolean } from "../../../decorators/IsValidBoolean.js";

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

export class SendMessageDto {
    @IsMessageType(false)
    type!: MessageType;

    @IsString()
    content!: string;
}

export class UpdateMessageDto {
    @IsString()
    content!: string;
}

export class PinMessageDto {
    @IsValidBoolean(false)
    pinned!: boolean;
}