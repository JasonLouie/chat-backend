import { AppDataSource } from "../db/data-source.js";
import { ChatMember } from "../entities/ChatMember.js";
import type { UUID } from "../types/common.js";

export class ChatMemberService {
    private chatMemberRepo = AppDataSource.getRepository(ChatMember);

    async addMember(chatId: UUID, userId: UUID) {

    }

    async removeMember(chatId: UUID, userId: UUID) {

    }
}