import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "../../users/user.entity.js";
import type { UUID } from "../../../types/common.js";

@Entity({ name: "refresh_tokens" })
export class RefreshToken {
    @PrimaryColumn({ type: "varchar", length: 255 })
    token!: string;

    @Column("uuid")
    userId!: UUID;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: "datetime" })
    expiresAt!: Date;

    @ManyToOne(() => User, (user) => user.tokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;
}
