import { DataSource } from "typeorm";
import { User } from "../modules/users/user.entity.js";
import { Profile } from "../modules/users/profiles/profile.entity.js";
import { Message } from "../modules/chats/messages/message.entity.js";
import { Chat } from "../modules/chats/chat.entity.js";
import { ChatMember } from "../modules/chats/members/chat-member.entity.js";
import { RefreshToken } from "../modules/auth/tokens/refresh-token.entity.js";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "chat_app",
    synchronize: process.env.NODE_ENV !== "production",
    logging: process.env.NODE_ENV !== "production",
    namingStrategy: new SnakeNamingStrategy,
    entities: [User, Profile, Chat, ChatMember, Message, RefreshToken],
    migrations: [],
    subscribers: [],
    timezone: "Z",
    ssl: { rejectUnauthorized: true }
});