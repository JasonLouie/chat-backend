import { Between, ILike, LessThan, MoreThan, type EntityManager, type FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../db/data-source.js";
import { Chat } from "../entities/Chat.js";
import { Message } from "../entities/Message.js";
import { ChatType, MessageType } from "../enums.js";
import { EndpointError } from "../classes/EndpointError.js";
import { ChatMemberService } from "./ChatMemberService.js";
import type { UUID } from "../types/common.js";
import type { DataSource } from "typeorm/browser";

export class MessageService {
    private dataSource: DataSource;
    private chatMemberService: ChatMemberService;

    constructor(chatMemberService: ChatMemberService) {
        this.dataSource = AppDataSource;
        this.chatMemberService = chatMemberService;
    }

    /**
     * Toggle pinning a message. Allow users to toggle pinning messages regardless of the sender.
     */
    public toggleMessagePinned = async (messageId: UUID, chatId: UUID, userId: UUID): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(manager, chatId, userId);

            const message = await this.findMessageOrThrow(manager, messageId);
            message.pinned = !message.pinned;
            await manager.save(Message, message);
        });
    }

    /**
     * Search for messages
     */
    public searchMessages = async (chatId: UUID, userId: UUID, keyword?: string, type?: MessageType, beforeDate?: Date, afterDate?: Date, pinned?: boolean): Promise<Message[]> => {
        const manager = this.dataSource.manager;
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
    }

    /**
     * Handles sending messages in a chat group
     */
    public sendMessage = async (chatId: UUID, senderId: UUID, content: string, type?: MessageType): Promise<Message> => {
        return await this.dataSource.transaction(async (manager) => {
            const { chat } = await this.chatMemberService.validateChatMembership(manager, chatId, senderId, true);

            if (chat.type === ChatType.DM) {
                // Find the recipient
                const recipientMember = await this.chatMemberService.getExistingMember(manager, chatId, senderId, true, true);
                
                if (recipientMember && recipientMember.deletedAt) {
                    await manager.recover(recipientMember);
                }
            }

            const newMessage = await manager.save(Message, {
                chatId,
                senderId,
                content,
                ...(type !== undefined && { type })
            });

            await this.updateLastMessage(manager, chatId, newMessage);
            return newMessage;
        });
    }

    /**
     * Handles updating a message
     */
    public updateMessage = async (messageId: UUID, chatId: UUID, userId: UUID, newContent: string): Promise<void> => {
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

    /**
     * Handles deleting a message
     */
    public deleteMessage = async (messageId: UUID, chatId: UUID, userId: UUID): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(manager, chatId, userId, true);
                        
            const chat = await manager.findOne(Chat, {
                where: { id: chatId },
                relations: { lastMessage: true }
            });
            if (!chat) throw new EndpointError(404, "Chat not found.");

            const message = await this.findMessageOrThrow(manager, messageId);

            if (userId !== message.senderId) throw new EndpointError(403, "Cannot delete messages that do not belong to you.");

            const isLatestMessage = chat.lastMessage?.id === message.id;

            await manager.softRemove(Message, message);

            if (isLatestMessage) await this.updateLastMessage(manager, chatId);
        });
    }

    /**
     * Returns a particular message by messageId. Throws an error if the message does not exist.
     */
    private findMessageOrThrow = async (manager: EntityManager, messageId: UUID): Promise<Message> => {
        const message = await manager.findOneBy(Message, { id: messageId });
        if (!message) throw new EndpointError(404, "Message not found.");
        return message;
    }

    /**
     * Handles updating the last message of a chat
     */
    private updateLastMessage = async (manager: EntityManager, chatId: UUID, lastMessage?: Message): Promise<void> => {
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