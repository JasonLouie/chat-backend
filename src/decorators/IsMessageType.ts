import { IsEnum, IsOptional } from "class-validator"
import { MessageType } from "../modules/chats/messages/message.types.js"

export function IsMessageType(optional = true) {
    return function (object: Object, propertyName: string) {
        IsEnum(MessageType, { message: "Type must be text, image, or system" })(object, propertyName);
        if (optional) {
            IsOptional()(object, propertyName);
        }
    }
}