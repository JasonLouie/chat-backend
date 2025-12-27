import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "../user.entity.js";
import { UserStatus } from "../user.types.js";
import type { UUID } from "../../../common/types/common.js";

@Entity({ name: "profiles" })
export class Profile {
    @PrimaryColumn("uuid")
    id!: UUID;

    @Column({ type: "varchar", length: 50 })
    displayName!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    imageUrl!: string | null;

    @Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE })
    status!: UserStatus;

    @Column({ type: "varchar", length: 500, nullable: true })
    bio!: string | null;

    @OneToOne(() => User, (user) => user.profile, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "id" })
    user!: User;
}