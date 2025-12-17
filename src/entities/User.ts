import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./Profile.js";
import { ChatMember } from "./ChatMember.js";
import { Message } from "./Message.js";
import { RefreshToken } from "./RefreshToken.js";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true, length: 50 })
    username!: string;

    @Column({ select: false, unique: true, length: 255 })
    email!: string;

    @Column({ select: false })
    password_hash!: string;

    @CreateDateColumn()
    created_at!: Date;

    @OneToOne(() => Profile, (profile) => profile.user, {
        cascade: true,
        eager: true
    })
    profile!: Profile;

    @OneToMany(() => ChatMember, (chatMember) => chatMember.user)
    chatMembers!: ChatMember[];

    @OneToMany(() => Message, (message) => message.sender)
    messages!: Message[];

    @OneToMany(() => RefreshToken, (token) => token.user)
    refreshTokens!: RefreshToken[];
}