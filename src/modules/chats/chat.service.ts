import { DataSource, Repository, type EntityManager } from "typeorm";
import { AppDataSource } from "../../db/data-source.js";
import { Chat } from "./chat.entity.js";
import type { UUID } from "../../common/types/common.js";
import { EndpointError } from "../../common/errors/EndpointError.js";
import { ChatType, type ModifyChatGroup } from "./chat.types.js";
import { ChatMemberService } from "./members/chat-member.service.js";
import { UserService } from "../users/user.service.js";

export class ChatService {
    constructor(
        private userService: UserService,
        private chatMemberService: ChatMemberService,
        private defaultRepo: Repository<Chat> = AppDataSource.getRepository(Chat),
        private dataSource: DataSource = AppDataSource
    ) {}

    /**
     * Returns list of chats the user is in. Chat Dashboard functionality
     */
    public getUserChats = async (userId: UUID): Promise<Chat[]> => {
        return await this.defaultRepo.createQueryBuilder("chat")
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
                "chat.numParticipants",
                "lastMsg.content",
                "lastMsg.createdAt",
                "msgSender.username"
            ])
            .orderBy("lastMsg.createdAt", "DESC")
            .getMany();
    }

    /**
     * Creates a new chat (Group or DM).
     * @param creatorId - The user initiating the chat
     * @param memberIds - Array of OTHER users to add (excluding creator)
     * @param name - (Optional) Group Name
     * @param imageUrl - (Optional) Group Image
     */
    public createChat = async (creatorId: UUID, memberIds: UUID[], name?: string, imageUrl?: string): Promise<Chat> => {
        return await this.dataSource.transaction(async (manager) => {
            // Ensure no duplicate ids and creator isn't in memberIds
            const uniqueMemberIds = [...new Set(memberIds)].filter(id => id !== creatorId);
        
            if (uniqueMemberIds.length === 0) throw new EndpointError(400, "You must add at least one other member.");

            const validUserCount = await this.userService.countUsers(uniqueMemberIds, manager);
            if (validUserCount !== uniqueMemberIds.length) throw new EndpointError(404, "One or more users do not exist.");

            if (uniqueMemberIds.length === 1) {
                return await this.handleCreateDM(manager, creatorId, uniqueMemberIds[0] as UUID);
            } else {
                if (uniqueMemberIds.length > 9) throw new EndpointError(400, "Group chats cannot exceed 10 members.");
                return await this.handleCreateGroup(manager, creatorId, uniqueMemberIds, name, imageUrl);
            }
        });
    }

    /**
     * Modifies a chat group (name or imageUrl)
     */
    public modifyChatGroup = async (chatId: UUID, userId: UUID, updates: ModifyChatGroup | {}): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            const { chat } = await this.chatMemberService.validateChatMembership(chatId, userId, true, manager);

            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot modify settings for a private chat.");
        
            // Do not run DB query if there are no updates
            if (Object.keys(updates).length === 0) return;

            await manager.save(Chat, updates);
        });
    }

    /**
     * Restores a deleted private chat for a particular user
     */
    private restoreChat = async (manager: EntityManager, chatId: UUID, userId: UUID): Promise<void> => {
        const member = await this.chatMemberService.getExistingMember(chatId, userId, manager, true);

        // Member cannot be null because an existing chat was already found before reaching this helper function.
        if (member && member.deletedAt !== null) {
            await manager.recover(member);
        }
    }

    /**
     * Creates a private chat between two users. Makes an existing DM visible for userA if it was previously hidden.
     */
    private handleCreateDM = async (manager: EntityManager, userA: UUID, userB: UUID): Promise<Chat> => {
        const existingChat = await manager
            .createQueryBuilder(Chat, "chat")
            .innerJoin("chat.members", "memberA")
            .innerJoin("chat.members", "memberB")
            .where("chat.type = :type", { type: ChatType.DM })
            .andWhere("memberA.userId = :userA", { userA })
            .andWhere("memberB.userId = :userB", { userB })
            .getOne();
        
        if (existingChat) {
            // If chat exists, ensure both members are active (not soft deleted)
            // Reopen the DM for user A if they had it closed
            await this.restoreChat(manager, existingChat.id, userA);
            return existingChat;
        }

        // Create Chat entity
        const chat = manager.create(Chat, {
            type: ChatType.DM
        });
        const savedChat = await manager.save(Chat, chat);

        // Create members
        await this.chatMemberService.createDMMembers(savedChat.id, [userA, userB], manager);
        return savedChat;
    }

    /**
     * Creates a group chat
     */
    private async handleCreateGroup(manager: EntityManager, creatorId: UUID, memberIds: UUID[], name?: string, imageUrl?: string): Promise<Chat> {
        // Create Chat entity
        const chat = manager.create(Chat, {
            type: ChatType.GROUP,
            name: name || "Untitled Chat Group",
            imageUrl: imageUrl || null
        });
        const savedChat = await manager.save(Chat, chat);

        // Create members
        await this.chatMemberService.createGroupMembers(savedChat.id, memberIds, creatorId, manager);
        return savedChat;
    }
}