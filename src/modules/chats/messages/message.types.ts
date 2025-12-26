import type { MessageType } from "../../../enums.js";

export interface GetChatMessagesQuery {
    cursor?: Date | undefined;
    limit?: number | undefined;
}

export interface SearchMessageQuery {
    keyword?: string | undefined;
    type?: MessageType | undefined;
    beforeDate?: Date | undefined;
    afterDate?: Date | undefined;
    pinned?: boolean | undefined;
    limit?: number | undefined;
}
