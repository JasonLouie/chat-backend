export type UUID = string;

export type Token = string;

export interface Tokens {
    accessToken: Token;
    refreshToken: Token;
}

export interface ProfileParams {
    userId?: UUID;
}

export interface ChatParams {
    chatId?: UUID;
}

export interface MemberParams {
    chatId?: UUID;
    memberId?: UUID;
}

export interface MessageParams {
    chatId?: UUID;
    messageId?: UUID;
}