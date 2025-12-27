import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatMember } from "./members/chat-member.entity.js";
import { Message } from "./messages/message.entity.js";
import type { UUID } from "../../common/types/common.js";
import { ChatType } from "./chat.types.js";

@Entity({ name: "chats" })
export class Chat {
    @PrimaryGeneratedColumn("uuid")
    id!: UUID;

    @Column({ type: "boolean", default: false })
    isGroup!: boolean;

    @Column({ type: "varchar", length: 255, nullable: true })
    imageUrl!: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    name!: string | null;

    @Column({ type: "enum", enum: ChatType, default: ChatType.DM })
    type!: ChatType;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => ChatMember, (chatMember) => chatMember.chat)
    members!: ChatMember[];

    @OneToMany(() => Message, (message) => message.chat)
    messages!: Message[];

    @OneToOne(() => Message, { nullable: true })
    @JoinColumn({ name: "last_message_id" })
    lastMessage!: Message | null;

    numParticipants?: number;
}