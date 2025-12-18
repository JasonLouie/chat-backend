import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserRole } from "../enums.js";
import { Chat } from "./Chat.js";
import { User } from "./User.js";

@Entity({ name: "chat_members"})
export class ChatMember {
    @PrimaryColumn("uuid")
    chatId!: string;

    @PrimaryColumn("uuid")
    userId!: string;

    // Database mapping: SQL column member_role -> role (TS)
    @Column({
        name: "member_role",
        type: "enum",
        enum: UserRole,
        default: UserRole.MEMBER
    })
    role!: UserRole;

    @CreateDateColumn()
    joinedAt!: Date;

    @Column({ type: "datetime", nullable: true })
    lastReadAt!: Date | null;

    @ManyToOne(() => Chat, (chat) => chat, { onDelete: "CASCADE" })
    @JoinColumn({ name: "chat_id" })
    chat!: Chat;

    @ManyToOne(() => User, (user) => user, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;
}