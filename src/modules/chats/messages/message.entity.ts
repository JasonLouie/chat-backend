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
import { Chat as ChatEntity } from "../chat.entity.js";
import type { Chat } from "../chat.entity.js";
import { User as UserEntity } from "../../users/user.entity.js";
import type { User } from "../../users/user.entity.js";
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

    @ManyToOne(() => ChatEntity, (chat) => chat, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_id" })
    chat!: Chat;

    @ManyToOne(() => UserEntity, (user) => user, { onDelete: "CASCADE" })
    @JoinColumn({ name: "sender_id" })
    sender!: User;
}
