import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./Profile.js";
import { ChatMember } from "./ChatMember.js";
import { Message } from "./Message.js";
import { RefreshToken } from "./RefreshToken.js";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 50, unique: true })
    username!: string;

    @Column({ select: false, type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ select: false, type: "varchar", length: 255 })
    passwordHash!: string;

    @CreateDateColumn()
    createdAt!: Date;

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
    tokens!: RefreshToken[];
}