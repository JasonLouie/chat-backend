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

@Entity({ name: "messages" })
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("uuid")
    chatId!: string;

    @Column("uuid")
    senderId!: string;

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
