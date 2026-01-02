export enum ChatRole {
    OWNER = "owner",
    MEMBER = "member"
}

export enum ChatType {
    DM = "dm",
    GROUP = "group"
}

export interface ModifyChatGroup {
    imageUrl?: string;
    name?: string;
}