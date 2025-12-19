import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User.js";
import { Profile } from "../entities/Profile.js";
import { Message } from "../entities/Message.js";
import { Chat } from "../entities/Chat.js";
import { ChatMember } from "../entities/ChatMember.js";
import { RefreshToken } from "../entities/RefreshToken.js";
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