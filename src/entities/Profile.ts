import { Column, Entity, OneToOne, PrimaryGeneratedColumn,  } from "typeorm";
import { User } from "./User.js";
import { UserStatus } from "../enums.js";

@Entity({ name: "profiles" })
export class Profile {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ length: 255, nullable: true })
    image_url!: string | null;

    @Column({ type: "enum", enum: UserStatus, default: UserStatus.OFFLINE })
    status!: UserStatus;

    @OneToOne(() => User, (user) => user.profile)
    user!: User;
}