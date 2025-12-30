export enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    SYSTEM = "system"
}

export interface GetMessagesQuery {
    cursor?: Date | undefined;
    limit?: number | undefined;
}

export interface SearchMessagesQuery {
    keyword?: string | undefined;
    type?: MessageType | undefined;
    beforeDate?: Date | undefined;
    afterDate?: Date | undefined;
    pinned?: boolean | undefined;
    limit?: number | undefined;
}

export interface SendMessageBody {
    type: MessageType;
    content: string;
}

export interface UpdateMessageBody {
    content: string;
}

export interface PinMessageBody {
    pinned: boolean;
}