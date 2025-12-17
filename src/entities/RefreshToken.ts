import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./User.js";

@Entity({ name: "refresh_tokens" })
export class RefreshToken {
    @PrimaryColumn({ length: 255 })
    token!: string;

    @Column("uuid")
    user_id!: string;

    @CreateDateColumn()
    created_at!: Date;

    @Column()
    expires_at!: Date;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;
}
