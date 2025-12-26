import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { ChatRole } from "../../../enums.js";
import { Chat } from "../chat.entity.js";
import { User } from "../../users/user.entity.js";
import type { UUID } from "../../../types/common.js";

@Entity({ name: "chat_members"})
export class ChatMember {
    @PrimaryColumn("uuid")
    chatId!: UUID;

    @PrimaryColumn("uuid")
    userId!: UUID;

    // Database mapping: SQL column member_role -> role (TS)
    @Column({
        name: "member_role",
        type: "enum",
        enum: ChatRole,
        default: ChatRole.MEMBER
    })
    role!: ChatRole;

    @CreateDateColumn()
    joinedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;

    @Column({ type: "datetime", nullable: true })
    lastReadAt!: Date | null;

    @ManyToOne(() => Chat, (chat) => chat, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_id" })
    chat!: Chat;

    @ManyToOne(() => User, (user) => user, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;
}