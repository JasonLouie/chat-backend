import { AppDataSource } from "../db/data-source.js";
import { Chat } from "../entities/Chat.js";
import { Message } from "../entities/Message.js";
import { MessageType } from "../enums.js";

export class MessageService {
    private chatRepo = AppDataSource.getRepository(Chat);
    private messageRepo = AppDataSource.getRepository(Message);

    async sendMessage(chatId: string, senderId: string, content: string, type?: MessageType) {
        // Save new message to DB
        const newMessage = await this.messageRepo.save({
            chatId,
            senderId,
            content,
            ...(type !== undefined && { type })
        });

        // Update Chat's latest message
        await this.chatRepo.update(chatId, {
            lastMessage: newMessage
        });

        return newMessage;
    }
}