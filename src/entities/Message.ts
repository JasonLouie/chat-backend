import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MessageType } from "../enums.js";
import { Chat } from "./Chat.js";
import { User } from "./User.js";
import type { UUID } from "../types/common.js";

@Entity({ name: "messages" })
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id!: UUID;

    @Column("uuid")
    chatId!: UUID;

    @Column("uuid")
    senderId!: UUID;

    @Column({ type: "enum", enum: MessageType, default: MessageType.TEXT })
    type!: MessageType;

    @Column({ type: "text" })
    content!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => Chat, (chat) => chat, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_id" })
    chat!: Chat;

    @ManyToOne(() => User, (user) => user, { onDelete: "CASCADE" })
    @JoinColumn({ name: "sender_id" })
    sender!: User;
}
