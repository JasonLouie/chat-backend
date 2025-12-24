export type UUID = string;

export type Token = string;

export interface Tokens {
    accessToken: Token;
    refreshToken: Token;
}

export interface ChatParams {
    chatId?: UUID;
    memberId?: UUID;
}