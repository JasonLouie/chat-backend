import { DataSource, type EntityManager } from "typeorm";
import { AppDataSource } from "../db/data-source.js";
import { Chat } from "../entities/Chat.js";
import type { UUID } from "../types/common.js";
import { EndpointError } from "../classes/EndpointError.js";
import { ChatType } from "../enums.js";
import type { ChatMemberService } from "./ChatMemberService.js";

export class ChatService {
    private dataSource: DataSource;
    private chatMemberService: ChatMemberService;

    constructor(chatMemberService: ChatMemberService) {
        this.dataSource = AppDataSource;
        this.chatMemberService = chatMemberService;
    }

    /**
     * Returns list of chats the user is in. Chat Dashboard functionality
     */
    async getUserChats(userId: UUID): Promise<Chat[]> {
        return await this.dataSource.getRepository(Chat).createQueryBuilder("chat")
            // Only get chats where this user is a member
            .innerJoin("chat.members", "member")
            .where("member.userId = :userId", { userId })

            // Count all members for these chats and add virtual prop
            .loadRelationCountAndMap("chat.numParticipants", "chat.members")

            // Get latest message
            .leftJoin("chat.lastMessage", "lastMsg")

            // Get details on message's sender
            .leftJoin("lastMsg.sender", "msgSender")
            
            // Select particular fields
            .select([
                "chat.id",
                "chat.name",
                "chat.isGroup",
                "chat.imageUrl",
                "lastMsg.content",
                "lastMsg.createdAt",
                "msgSender.username"
            ])
            .orderBy("lastMsg.createdAt", "DESC")
            .getMany();
    }

    async createChat() {
        
    }

    async modifyChatGroup(chatId: UUID, userId: UUID, newName?: string, newImageUrl?: string) {
        return await this.dataSource.transaction(async (manager) => {
            const chat = await this.getChatOrThrow(manager, chatId);

            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot modify settings for a private chat.");
        
            await this.chatMemberService.validateChatMembership(manager, chatId, userId);

            if (!newName && !newImageUrl) return;

            if (newName) {
                chat.name = newName;
            }

            if (newImageUrl) {
                chat.imageUrl = newImageUrl;
            }

            await manager.save(Chat, chat);
        });
    }

    async softDeleteChat(manager: EntityManager, chat: Chat) {
        await manager.softRemove(Chat, chat);
    }

    async getChatOrThrow(manager: EntityManager, chatId: UUID, lastMessage: boolean = false) {
        const chat = await manager.findOne(Chat, {
            where: { id: chatId },
            ...(lastMessage && { relations: { lastMessage: true } })
        });
        if (!chat) throw new EndpointError(404, "Chat not found.");
        return chat;
    }
}