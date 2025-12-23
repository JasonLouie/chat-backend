import { Between, ILike, LessThan, MoreThan, type EntityManager, type FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../db/data-source.js";
import { Chat } from "../entities/Chat.js";
import { Message } from "../entities/Message.js";
import { MessageType } from "../enums.js";
import type { UUID } from "../types/common.js";
import { EndpointError } from "../classes/EndpointError.js";
import type { ChatMemberService } from "./ChatMemberService.js";
import type { DataSource } from "typeorm/browser";
import type { ChatService } from "./ChatService.js";

export class MessageService {
    private dataSource: DataSource;
    private chatService: ChatService;
    private chatMemberService: ChatMemberService;

    constructor(chatService: ChatService, chatMemberService: ChatMemberService) {
        this.dataSource = AppDataSource;
        this.chatService = chatService;
        this.chatMemberService = chatMemberService;
    }

    /**
     * Toggle pinning a message. Allow users to toggle pinning messages regardless of the sender.
     */
    async toggleMessagePinned(messageId: UUID, chatId: UUID, userId: UUID) {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(manager, chatId, userId);

            const message = await this.findMessageOrThrow(manager, messageId);
            message.pinned = !message.pinned;
            await manager.save(Message, message);
        });
    }

    async searchMessages(chatId: UUID, userId: UUID, keyword?: string, type?: MessageType, beforeDate?: Date, afterDate?: Date, pinned?: boolean): Promise<Message[]> {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(manager, chatId, userId);

            const where: FindOptionsWhere<Message> = {
                chatId
            };

            // Date Filters
            if (beforeDate && afterDate) {
                where.createdAt = Between(afterDate, beforeDate);
            } else if (beforeDate) {
                where.createdAt = LessThan(beforeDate);
            } else if (afterDate) {
                where.createdAt = MoreThan(afterDate);
            }

            // Type Filter
            if (type) {
                where.type = type;
            }

            // Pinned Filter
            if (pinned !== undefined) {
                where.pinned = pinned;
            }

            // Only search by keyword for text
            const isSearchable = !type || type === MessageType.TEXT;

            if (keyword && isSearchable) {
                where.content = ILike(`%${keyword}%`);
            }

            return await manager.find(Message, {
                where,
                order: { createdAt: "DESC" },
                relations: { sender: true }
            });
        });
    }

    async sendMessage(chatId: UUID, senderId: UUID, content: string, type?: MessageType) {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(manager, chatId, senderId);

            const newMessage = await manager.save(Message, {
                chatId,
                senderId,
                content,
                ...(type !== undefined && { type })
            });

            await this.updateLastMessage(manager, chatId, newMessage);
        });
    }

    async updateMessage(messageId: UUID, chatId: UUID, userId: UUID, newContent: string) {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(manager, chatId, userId);

            const message = await this.findMessageOrThrow(manager, messageId);

            if (userId !== message.senderId) throw new EndpointError(403, "Cannot edit messages that do not belong to you.");
            
            if (message.content === newContent) return;

            message.content = newContent;
            message.editedAt = new Date();

            await manager.save(Message, message);
        });
    }

    async deleteMessage(messageId: UUID, chatId: UUID, userId: UUID) {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(manager, chatId, userId);

            const message = await this.findMessageOrThrow(manager, messageId);

            if (userId !== message.senderId) throw new EndpointError(403, "Cannot delete messages that do not belong to you.");
            
            const chat = await this.chatService.getChatOrThrow(manager, chatId, true);

            if (!chat) throw new EndpointError(404, "Chat not found");

            const isLatestMessage = chat.lastMessage?.id === message.id;

            await manager.softRemove(Message, message);

            if (isLatestMessage) await this.updateLastMessage(manager, chatId);
        });
    }

    private async findMessageOrThrow(manager: EntityManager, messageId: UUID) {
        const message = await manager.findOneBy(Message, { id: messageId });
        if (!message) throw new EndpointError(404, "Message not found.");
        return message;
    }

    private async updateLastMessage(manager: EntityManager, chatId: UUID, lastMessage?: Message) {
        let message: Message | null | undefined = lastMessage;
        
        if (message === undefined) {
            message = await manager.findOne(Message, {
                where: { chatId },
                order: { createdAt: "DESC" }
            });
        }
        
        await manager.update(Chat, chatId, {
            lastMessage: message
        });
    }
}