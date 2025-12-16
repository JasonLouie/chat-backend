import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Profile } from "./Profile.js";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true, length: 50 })
    username!: string;

    @Column({ unique: true, length: 255 })
    email!: string;

    @Column({ select: false, length: 255 })
    password_hash!: string;

    @CreateDateColumn()
    created_at!: Date;

    @OneToOne(() => Profile, (profile) => profile.user, {
        cascade: true,
        eager: true
    })
    @JoinColumn()
    profile!: Profile;
}