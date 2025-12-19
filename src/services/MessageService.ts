import type { EntityManager } from "typeorm";
import { AppDataSource } from "../db/data-source.js";
import { Chat } from "../entities/Chat.js";
import { Message } from "../entities/Message.js";
import { MessageType } from "../enums.js";
import type { UUID } from "../types/common.js";
import { ChatMember } from "../entities/ChatMember.js";
import { EndpointError } from "../classes/EndpointError.js";

export class MessageService {
    private dataSource = AppDataSource;

    async findMessage() {
        
    }

    async sendMessage(chatId: UUID, senderId: UUID, content: string, type?: MessageType) {
        // Save new message to DB
        return await this.dataSource.transaction(async (manager) => {
            const isChatMember = this.validateChatMember(manager, chatId, senderId);
            if (!isChatMember) throw new EndpointError(401, "Cannot send messages to a chat you are not part of.");

            const newMessage = await manager.save(Message, {
                chatId,
                senderId,
                content,
                ...(type !== undefined && { type })
            });

            await this.updateLastMessage(manager, chatId, newMessage);
        });
    }

    async updateMessage(chatId: UUID, senderId: UUID, content: string) {
        return await this.dataSource.transaction(async (manager) => {
            
        });
    }

    private async findMessageOrThrow(manager: EntityManager, messageId: UUID) {
        const message = await manager.findOneBy(Message, { id: messageId });
        if (!message) throw new EndpointError(404, "Message not found.");
        
    }

    private async validateChatMember(manager: EntityManager, chatId: UUID, userId: UUID) {
        const member = await manager.findOne(ChatMember, {
            where: { chatId, userId }
        });
        return member;
    }

    private async updateLastMessage(manager: EntityManager, chatId: UUID, message: Message) {
        await manager.update(Chat, chatId, {
            lastMessage: message
        });
    }
}