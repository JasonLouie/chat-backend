import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./Profile.js";
import { ChatMember } from "./ChatMember.js";
import { Message } from "./Message.js";
import { RefreshToken } from "./RefreshToken.js";
import type { UUID } from "../types/common.js";
import bcrypt from "bcryptjs";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: UUID;

    @Column({ type: "varchar", length: 50, unique: true })
    username!: string;

    @Column({ select: false, type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ name: "password_hash", select: false, type: "varchar", length: 255 })
    password!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        // If password is empty/undefined, do nothing
        if (!this.password) return;

        // Prevent double hashing. Bcrypt hashes are 60 chars long and start with $2.
        if (this.password.length === 60 && this.password.startsWith("$2")) return;

        const salt = await bcrypt.genSalt(13);
        this.password = await bcrypt.hash(this.password, salt);
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return await bcrypt.compare(candidatePassword, this.password);
    }

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