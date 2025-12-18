import { AppDataSource } from "../db/data-source.js";
import { Chat } from "../entities/Chat.js";

export class ChatService {
    private chatRepo = AppDataSource.getRepository(Chat);

    async getUserChats(userId: string): Promise<Chat[]> {
        return await this.chatRepo.createQueryBuilder("chat")
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

    async modifyChatGroup(chatId: string) {
        // Access ChatMemberService
    }
}