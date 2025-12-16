import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMember } from "./ChatMember.js";
import { Message } from "./Message.js";

@Entity({ name: "chats" })
export class Chat {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ default: false })
    is_group!: boolean;

    @Column({ length: 255, nullable: true })
    image_url!: string | null;

    @Column({ length: 100, nullable: true })
    name!: string | null;

    @CreateDateColumn()
    created_at!: Date;

    @OneToMany(() => ChatMember, (chatMember) => chatMember.chat)
    chatMembers!: ChatMember[];

    @OneToMany(() => Message, (message) => message.chat)
    messages!: Message[];
}