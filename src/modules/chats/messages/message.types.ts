export enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    SYSTEM = "system"
}

export interface SearchMessagesQuery {
    keyword?: string | undefined;
    type?: MessageType | undefined;
    beforeDate?: Date | undefined;
    afterDate?: Date | undefined;
    pinned?: boolean | undefined;
    limit?: number | undefined;
}