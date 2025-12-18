import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatMember } from "./ChatMember.js";
import { Message } from "./Message.js";

@Entity({ name: "chats" })
export class Chat {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "boolean", default: false })
    isGroup!: boolean;

    @Column({ type: "varchar", length: 255, nullable: true })
    imageUrl!: string | null;

    @Column({ type: "varchar", length: 100, nullable: true })
    name!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => ChatMember, (chatMember) => chatMember.chat)
    members!: ChatMember[];

    @OneToMany(() => Message, (message) => message.chat)
    messages!: Message[];

    @OneToOne(() => Message, { nullable: true })
    @JoinColumn({ name: "last_message_id" })
    lastMessage!: Message;

    numParticipants?: number;
}