import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { MessageType } from "./message.types.js";
import { Chat } from "../chat.entity.js";
import { User } from "../../users/user.entity.js";
import type { UUID } from "../../../common/types/common.js";

@Entity({ name: "messages" })
@Index(["chatId", "createdAt"])
export class Message {
    @PrimaryGeneratedColumn("uuid")
    id!: UUID;

    @Column("uuid")
    chatId!: UUID;

    @Column("uuid")
    senderId!: UUID;

    @Column({ type: "enum", enum: MessageType })
    type!: MessageType;

    @Column({ type: "text" })
    content!: string;

    @Column( { type: "boolean", default: false } )
    pinned!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: "datetime", nullable: true })
    editedAt!: Date | null;

    @ManyToOne(() => Chat, (chat) => chat, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_id" })
    chat!: Chat;

    @ManyToOne(() => User, (user) => user, { onDelete: "CASCADE" })
    @JoinColumn({ name: "sender_id" })
    sender!: User;
}
