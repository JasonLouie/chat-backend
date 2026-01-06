import {
    Between,
    ILike,
    LessThan,
    MoreThan,
    type EntityManager,
    type FindOptionsWhere,
} from "typeorm";
import { AppDataSource } from "../../../db/data-source.js";
import { Chat } from "../chat.entity.js";
import { Message } from "./message.entity.js";
import { EndpointError } from "../../../common/errors/EndpointError.js";
import { ChatMemberService } from "../members/chat-member.service.js";
import type { UUID } from "../../../common/types/common.js";
import type { DataSource, Repository } from "typeorm";
import { MessageType, type SearchMessagesQuery } from "./message.types.js";
import { ChatType } from "../chat.types.js";

export class MessageService {
    constructor(
        private chatMemberService: ChatMemberService,
        private defaultRepo: Repository<Message> = AppDataSource.getRepository(Message),
        private dataSource: DataSource = AppDataSource
    ) {}

    /**
     * Search for messages
     */
    public searchMessages = async (
        chatId: UUID,
        userId: UUID,
        filters: SearchMessagesQuery = {},
        validated: boolean = false
    ): Promise<Message[]> => {
        if (!validated) {
            await this.chatMemberService.validateChatMembership(chatId, userId);
        }

        const { keyword, type, beforeDate, afterDate, pinned, limit } = filters;

        const where: FindOptionsWhere<Message> = {
            chatId,
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

        return await this.defaultRepo.find({
            where,
            order: { createdAt: "DESC" },
            take: limit || 30,
            relations: { sender: true },
        });
    };

    /**
     * Handles sending messages
     */
    public sendMessage = async (
        chatId: UUID,
        senderId: UUID,
        content: string,
        type: MessageType
    ): Promise<Message> => {
        return await this.dataSource.transaction(async (manager) => {
            const { chat } =
                await this.chatMemberService.validateChatMembership(
                    chatId,
                    senderId,
                    true,
                    manager
                );

            if (chat.type === ChatType.DM) {
                // Find the recipient
                const recipientMember =
                    await this.chatMemberService.getExistingMember(
                        chatId,
                        senderId,
                        manager,
                        true,
                        true
                    );

                if (recipientMember && recipientMember.deletedAt) {
                    await manager.recover(recipientMember);
                }
            }

            const newMessage = await manager.save(Message, {
                chatId,
                senderId,
                content,
                type
            });

            await this.updateLastMessage(manager, chatId, newMessage);
            return newMessage;
        });
    };

    /**
     * Handles updating a text message
     */
    public updateMessage = async (
        messageId: UUID,
        chatId: UUID,
        userId: UUID,
        newContent: string
    ): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(
                chatId,
                userId,
                false,
                manager
            );

            const message = await this.findMessageOrThrow(manager, messageId);

            if (userId !== message.senderId){
                throw new EndpointError(
                    403,
                    "Cannot edit messages that do not belong to you."
                );
            }

            if (message.type !== MessageType.TEXT) {
                throw new EndpointError(
                    403,
                    "Only text messages can be edited."
                );
            }

            if (message.content === newContent) return;

            message.content = newContent;

            await manager.save(Message, message);
        });
    };

    /**
     * Toggle pinning a message. Allow users to toggle pinning messages regardless of the sender.
     */
    public pinMessage = async (
        messageId: UUID,
        chatId: UUID,
        userId: UUID,
        newPinState: boolean
    ): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(
                chatId,
                userId,
                false,
                manager
            );

            const message = await this.findMessageOrThrow(manager, messageId);
            message.pinned = newPinState;
            await manager.save(Message, message);
        });
    };

    /**
     * Handles deleting a message
     */
    public deleteMessage = async (
        messageId: UUID,
        chatId: UUID,
        userId: UUID
    ): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            await this.chatMemberService.validateChatMembership(
                chatId,
                userId,
                true,
                manager
            );

            const chat = await manager.findOne(Chat, {
                where: { id: chatId },
                relations: { lastMessage: true },
            });
            if (!chat) throw new EndpointError(404, "Chat not found.");

            const message = await manager.findOneBy(Message, { id: messageId });

            // If message is null, it was already deleted
            if (!message) return;

            if (userId !== message.senderId)
                throw new EndpointError(
                    403,
                    "Cannot delete messages that do not belong to you."
                );

            const isLatestMessage = chat.lastMessage?.id === message.id;

            await manager.softRemove(Message, message);

            if (isLatestMessage) await this.updateLastMessage(manager, chatId);
        });
    };

    /**
     * Returns a particular message by messageId. Throws an error if the message was not found.
     */
    private findMessageOrThrow = async (
        manager: EntityManager,
        messageId: UUID
    ): Promise<Message> => {
        const message = await manager.findOneBy(Message, { id: messageId });
        if (!message) throw new EndpointError(404, "Message not found.");
        return message;
    };

    /**
     * Handles updating the last message of a chat
     */
    private updateLastMessage = async (
        manager: EntityManager,
        chatId: UUID,
        lastMessage?: Message
    ): Promise<void> => {
        let message: Message | null | undefined = lastMessage;

        if (message === undefined) {
            message = await manager.findOne(Message, {
                where: { chatId },
                order: { createdAt: "DESC" },
            });
        }

        await manager.update(Chat, chatId, {
            lastMessage: message,
        });
    };
}
