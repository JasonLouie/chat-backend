import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "chats" })
export class Chat {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ default: false })
    is_group!: boolean;

    @Column({ length: 255, nullable: true })
    image_url!: string | null;

    @Column({ length: 100, nullable: true })
    name!: string | null;

    @CreateDateColumn()
    created_at!: Date;
}