export enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    BUSY = "busy",
    AWAY = "away"
}

export enum UserRole {
    ADMIN = "admin",
    MODERATOR = "moderator",
    MEMBER = "member"
}

export enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    VOICE = "voice",
    SYSTEM = "system"
}

export enum Status {
    Bad_Request = 400,
    Unauthorized = 401,
    Forbidden = 403,
    Not_Found = 404,
    Conflict = 409,
    Server_Error = 500
}