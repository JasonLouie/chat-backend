import { IsString, Length } from "class-validator";
import { ChatRules } from "../modules/chats/chat.rules.js";
import { Transform } from "class-transformer";

export function IsValidGroupName() {
    return function (object: Object, propertyName: string) {

        // Type Check
        IsString({
            message: "Chat name must be a string."
        })(object, propertyName);

        Transform(({ value }) => value?.trim())(object, propertyName);

        Length(ChatRules.NAME.MIN_LENGTH, ChatRules.NAME.MAX_LENGTH, {
            message: `Chat name must be between ${ChatRules.NAME.MIN_LENGTH} and ${ChatRules.NAME.MAX_LENGTH} characters.`
        });
    }
}