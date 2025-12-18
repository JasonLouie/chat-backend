import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./User.js";
import { UserStatus } from "../enums.js";

@Entity({ name: "profiles" })
export class Profile {
    @PrimaryColumn("uuid")
    id!: string;

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