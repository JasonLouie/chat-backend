import { Not, type EntityManager } from "typeorm";
import { EndpointError } from "../classes/EndpointError.js";
import { AppDataSource } from "../db/data-source.js";
import { ChatMember } from "../entities/ChatMember.js";
import type { UUID } from "../types/common.js";
import { ChatRole, ChatType } from "../enums.js";
import type { ChatService } from "./ChatService.js";
import type { DataSource } from "typeorm/browser";

export class ChatMemberService {
    private chatService: ChatService
    private dataSource: DataSource;

    constructor(chatService: ChatService) {
        this.dataSource = AppDataSource;
        this.chatService = chatService;
    }

    /**
     * Handles leaving chats (DMs and Groups)
     */
    async leaveChat(chatId: UUID, userId: UUID) {
        return await this.dataSource.transaction(async (manager) => {
            // Get member
            const member = await this.getMemberOrThrow(manager, chatId, userId);
            const { chat } = member;

            if (chat.type === ChatType.DM) {
                // Hide the member
                await this.softDeleteMember(manager, member);
            } else {
                await this.handleGroupLeave(manager, member);
            }
        });
    }

    // Chat Group Only

    /**
     * Any member can add others to the group if the group is less than 10 members
     */
    async addMember(chatId: UUID, initiatingUserId: UUID, newMemberId: UUID) {
        return await this.dataSource.transaction(async (manager) => {
            // Check if the chat is a group
            const chat = await this.chatService.getChatOrThrow(manager, chatId);
            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot add members to a private chat.");

            // Check if the initiating user is in the group
            const [initiatingUser, memberCount, existingMember] = await Promise.all([
                this.getExistingMember(manager, chatId, initiatingUserId),
                this.countMembers(manager, chatId),
                this.getExistingMember(manager, chatId, newMemberId, true)
            ]);

            if (!initiatingUser) throw new EndpointError(401, "Cannot add a member to a group you are not part of.");
            if (memberCount >= 10) throw new EndpointError(400, "Chat is full.");
            if (initiatingUserId === newMemberId) throw new EndpointError(400, "Cannot add yourself to a group.");

            // Check if new member exists in the group
            if (existingMember) {
                if (existingMember.deletedAt) {
                    // If they were a member in the past, bring them back but reset their role to MEMBER
                    existingMember.role = ChatRole.MEMBER;
                    return await manager.recover(ChatMember, existingMember);
                }
                throw new EndpointError(400, "User is already in the chat.");
            }

            // Handle adding a new member
            await manager.save(ChatMember, {
                chatId,
                userId: newMemberId
            });
        });
    }

    async removeMember(chatId: UUID, initiatingUserId: UUID, memberId: UUID) {
        return await this.dataSource.transaction(async (manager) => {
            // Check if the chat is a group
            const chat = await this.chatService.getChatOrThrow(manager, chatId);
            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot remove members from a private chat.");

            // Check if the initiating user is in the group
            const [initiatingUser, memberToRemove] = await Promise.all([
                this.getExistingMember(manager, chatId, initiatingUserId),
                this.getExistingMember(manager, chatId, memberId)
            ]);

            if (!initiatingUser) throw new EndpointError(401, "Cannot remove a member from a chat group you are not part of.");
            
            // Only OWNER can kick people
            if (initiatingUser.role !== ChatRole.OWNER) throw new EndpointError(403, "Only owners can remove members from a chat group.");

            // Owner attempting to kick themselves from a group
            if (initiatingUserId === memberId) throw new EndpointError(400, "Cannot kick yourself from a group. Use leave group instead.");

            // If the user is already gone, just return
            if (!memberToRemove) return;

            // Handle removing member
            await this.softDeleteMember(manager, memberToRemove);
        });
    }

    async switchOwnership(chatId: UUID, initiatingUserId: UUID, newOwnerId: UUID) {
        return await this.dataSource.transaction(async (manager) => {
            // Check if the chat is a group
            const chat = await this.chatService.getChatOrThrow(manager, chatId);
            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot remove members from a private chat.");

            // Check if the initiating user is in the group
            const [initiatingUser, newOwner] = await Promise.all([
                this.getExistingMember(manager, chatId, initiatingUserId),
                this.getExistingMember(manager, chatId, newOwnerId)
            ]);

            if (!initiatingUser) throw new EndpointError(401, "Cannot transfer ownership for a chat group you are not part of.");
            
            // Only OWNER can kick people
            if (initiatingUser.role !== ChatRole.OWNER) throw new EndpointError(403, "Only owners can remove members from a chat group.");
            
            // Cannot transfer ownership to yourself. You are already the owner!
            if (initiatingUserId === newOwnerId) throw new EndpointError(400, "Cannot transfer ownership to yourself.");
            
            // Cannot transfer ownership to someone who is not in the group
            if (!newOwner) throw new EndpointError(400, "Cannot transfer ownership to someone who is not in the chat group.");

            // Handle transfering ownership
            await this.transferOwnership(manager, chat.id, initiatingUserId, newOwner);
        });
    }

    async validateChatMembership(manager: EntityManager, chatId: UUID, userId: UUID) {
        const member = await manager.findOne(ChatMember, {
            where: { chatId, userId },
            select: ["chatId"]
        });
        if (!member) throw new EndpointError(403, "You are not a member of this chat.");
    }

    // Private helper methods

    /**
     * Check if the member exists. Optionally include members that were deleted
     */
    private async getExistingMember(manager: EntityManager, chatId: UUID, userId: UUID, withDeleted: boolean = false) {
        return await manager.findOne(ChatMember, {
            where: { chatId, userId },
            withDeleted
        });
    }

    /**
     * Returns the chat member with a particular chatId and userId. If none exists, throws an error.
     */
    private async getMemberOrThrow(manager: EntityManager, chatId: UUID, userId: UUID) {
        const member = await manager.findOne(ChatMember, {
            where: { chatId, userId },
            relations: { chat: true }
        });

        if (!member) throw new EndpointError(404, "Member not found.");
        return member;
    }

    /**
     * Counts the number of members in a group. Optional currentUserId to exclude a user from the count
     */
    private async countMembers(manager: EntityManager, chatId: UUID, currentUserId?: UUID) {
        return await manager.count(ChatMember, {
            where: {
                chatId,
                ...(currentUserId !== undefined && { userId: Not(currentUserId) } )
            }
        });
    }

    /**
     * Handles leaving a group
     */
    private async handleGroupLeave(manager: EntityManager, member: ChatMember) {
        // Check if the person leaving is the last one in the group
        const remainingCount = await this.countMembers(manager, member.chatId, member.userId);
        
        if (remainingCount === 0) {
            await this.chatService.softDeleteChat(manager, member.chat);
            return; // Chat is removed and related data is deleted via cascade
        }

        // Check if chat needs a new owner
        if (member.role === ChatRole.OWNER) await this.transferOwnership(manager, member.chatId, member.userId);

        // Handle user leaving the group
        await this.softDeleteMember(manager, member);
    }

    /**
     * Handles transferring ownership to a particular chat member or member with most seniority
     */
    private async transferOwnership(manager: EntityManager, chatId: UUID, currentOwnerId: UUID, newOwner?: ChatMember) {
        const seniorMember = newOwner || await manager.findOne(ChatMember,{
            where: {
                chatId,
                userId: Not(currentOwnerId)
            },
            order: { joinedAt: "ASC" }
        });

        if (seniorMember) {
            seniorMember.role = ChatRole.OWNER;
            await Promise.all([
                // Promote senior member
                manager.save(ChatMember, seniorMember),
                // Demote current owner
                manager.update(ChatMember,
                    { chatId, userId: currentOwnerId },
                    { role: ChatRole.MEMBER }
                )
            ]);
        }
    }

    private async softDeleteMember(manager: EntityManager, member: ChatMember) {
        await manager.softRemove(ChatMember, member);
    }

}