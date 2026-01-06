import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile as ProfileEntity } from "./profiles/profile.entity.js";
import type { Profile } from "./profiles/profile.entity.js";
import { ChatMember as ChatMemberEntity } from "../chats/members/chat-member.entity.js";
import type { ChatMember } from "../chats/members/chat-member.entity.js";
import { Message as MessageEntity } from "../chats/messages/message.entity.js";
import type { Message } from "../chats/messages/message.entity.js";
import { RefreshToken as RefreshTokenEntity } from "../auth/tokens/refresh-token.entity.js";
import type { RefreshToken } from "../auth/tokens/refresh-token.entity.js";
import type { UUID } from "../../common/types/common.js";
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

    @DeleteDateColumn( { nullable: true })
    deletedAt!: Date | null;

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

    @OneToOne(() => ProfileEntity, (profile) => profile.user, {
        cascade: true,
        eager: true
    })
    profile!: Profile;

    @OneToMany(() => ChatMemberEntity, (chatMember) => chatMember.user)
    chatMembers!: ChatMember[];

    @OneToMany(() => MessageEntity, (message) => message.sender)
    messages!: Message[];

    @OneToMany(() => RefreshTokenEntity, (token) => token.user)
    tokens!: RefreshToken[];
}