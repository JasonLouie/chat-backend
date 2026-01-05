import { Not, type EntityManager, type Repository, type DataSource } from "typeorm";
import { EndpointError } from "../../../common/errors/EndpointError.js";
import { AppDataSource } from "../../../db/data-source.js";
import { ChatMember } from "./chat-member.entity.js";
import type { UUID } from "../../../common/types/common.js";
import { ChatRole, ChatType } from "../chat.types.js";

export class ChatMemberService {
    constructor(
        private defaultRepo: Repository<ChatMember> = AppDataSource.getRepository(ChatMember),
        private dataSource: DataSource = AppDataSource
    ) {}

    /**
     * Returns all members of a chat
     */
    public getChatMembers = async (
        chatId: UUID,
        userId: UUID,
        validated: boolean = false
    ): Promise<ChatMember[]> => {
        const manager = this.dataSource.manager;
        if (!validated) {
            await this.validateChatMembership(chatId, userId);
        }
        return await manager.find(ChatMember, {
            where: { chatId },
            relations: {
                user: {
                    profile: true
                }
            },
            select: {
                role: true,
                joinedAt: true,
                user: {
                    id: true,
                    username: true,
                    profile: {
                        displayName: true,
                        imageUrl: true
                    }
                }
            },
            order: {
                joinedAt: "ASC"
            }
        });
    }

    /**
     * Handles leaving chats (DMs and Groups)
     */
    public leaveChat = async (chatId: UUID, userId: UUID): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            // Get member
            const member = await this.validateChatMembership(chatId, userId, true, manager);
            
            // If member is null, user already left the chat
            if (!member) return;

            // Handle different chat types
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
     * Add others to the group if the group is less than 10 members. All members are allowed to add new users to a group.
     */
    public addMember = async (chatId: UUID, initiatingUserId: UUID, newMemberId: UUID): Promise<ChatMember> => {
        return await this.dataSource.transaction(async (manager) => {
            // Check if user is in the chat
            const initiatingUser = await this.validateChatMembership(chatId, initiatingUserId, true, manager);
            
            // Check if the chat is a group
            const { chat } = initiatingUser;
            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot add members to a private chat.");

            // Check if the initiating user is in the group
            const [memberCount, existingMember] = await Promise.all([
                this.countMembers(chatId, undefined, manager),
                this.getExistingMember(chatId, newMemberId, manager, true)
            ]);

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
            return await manager.save(ChatMember, {
                chatId,
                userId: newMemberId
            });
        });
    }

    /**
     * Removes an existing member from the group. Only the group owner can do this.
     */
    public removeMember = async (chatId: UUID, initiatingUserId: UUID, memberId: UUID): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            // Check if user is in the chat
            const initiatingUser = await this.validateChatMembership(chatId, initiatingUserId, true, manager);
            
            // Check if the chat is a group
            const { chat } = initiatingUser;
            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot remove members from a private chat.");

            // Check if the initiating user is in the group
            const memberToRemove = await this.getExistingMember(chatId, memberId, manager);
            
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

    /**
     * Transfers ownership to a particular user. Only the group owner can do this.
     */
    public transferOwnership = async (chatId: UUID, initiatingUserId: UUID, newOwnerId: UUID): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            // Check if user is in the chat
            const initiatingUser = await this.validateChatMembership(chatId, initiatingUserId, true, manager);
            
            // Check if the chat is a group
            const { chat } = initiatingUser;
            if (chat.type !== ChatType.GROUP) throw new EndpointError(400, "Cannot remove members from a private chat.");

            // Check if the initiating user is in the group
            const newOwner = await this.getExistingMember(chatId, newOwnerId, manager);

            // Only OWNER can kick people
            if (initiatingUser.role !== ChatRole.OWNER) throw new EndpointError(403, "Only owners can remove members from a chat group.");
            
            // Cannot transfer ownership to yourself. You are already the owner!
            if (initiatingUserId === newOwnerId) throw new EndpointError(400, "Cannot transfer ownership to yourself.");
            
            // Cannot transfer ownership to someone who is not in the group
            if (!newOwner) throw new EndpointError(400, "Cannot transfer ownership to someone who is not in the chat group.");

            // Handle transfering ownership
            await this.handleNewOwner(manager, chat.id, initiatingUserId, newOwner);
        });
    }

    /**
     * Validates if the user is in a chat. Returns the member. Throws an error if the user is not a member of that chat. Optionally include chat.
     */
    public validateChatMembership = async (chatId: UUID, userId: UUID, withChat: boolean = false, manager?: EntityManager): Promise<ChatMember> => {
        const repo = manager ? manager.getRepository(ChatMember) : this.defaultRepo;
        const member = await repo.findOne({
            where: { chatId, userId },
            ...(!withChat ? { select: ["chatId"] } : { relations: { chat: true} }),
        });
        if (!member) throw new EndpointError(403, "You are not a member of this chat.");
        return member;
    }

    /**
     * Check if the member exists. Optionally include members that were deleted. Optionally exclude a particular user id from the search
     */
    public getExistingMember = async (chatId: UUID, userId: UUID, manager?: EntityManager, withDeleted: boolean = false, exclude: boolean = false): Promise<ChatMember | null> => {
        const repo = manager ? manager.getRepository(ChatMember) : this.defaultRepo;
        return await repo.findOne({
            where: {
                chatId,
                userId: exclude ? Not(userId) : userId
            },
            withDeleted
        });
    }

    /**
     * Creates Chat DM members (helper function for ChatService)
     */
    public createDMMembers = async (chatId: UUID, userIds: UUID[], manager?: EntityManager): Promise<void> => {
        const repo = manager ? manager.getRepository(ChatMember) : this.defaultRepo;
        const members = this.createChatMembers(chatId, userIds, manager);
        await repo.save(members);
    }

    /**
     * Creates Chat Group members (helper function for ChatService)
     */
    public createGroupMembers = async (chatId: UUID, memberIds: UUID[], creatorId: UUID, manager?: EntityManager): Promise<void> => {
        const repo = manager ? manager.getRepository(ChatMember) : this.defaultRepo;
        
        // Handle members
        const members = this.createChatMembers(chatId, memberIds, manager);

        // Handle creator
        members.push(repo.create({ chatId, userId: creatorId, role: ChatRole.OWNER }));
        
        await repo.save(members);
    }


    // Private helper methods

    /**
     * Returns an array of Chat Member entities
     */
    private createChatMembers = (chatId: UUID, memberIds: UUID[], manager?: EntityManager): ChatMember[] => {
        const repo = manager ? manager.getRepository(ChatMember) : this.defaultRepo;
        return memberIds.map((userId: UUID) => repo.create({ chatId, userId, role: ChatRole.MEMBER }));
    }

    /**
     * Counts the number of members in a group. Optional currentUserId to exclude a user from the count
     */
    private countMembers = async (chatId: UUID, currentUserId?: UUID, manager?: EntityManager): Promise<number> => {
        const repo = manager ? manager.getRepository(ChatMember) : this.defaultRepo;
        return await repo.count({
            where: {
                chatId,
                ...(currentUserId !== undefined && { userId: Not(currentUserId) } )
            }
        });
    }

    /**
     * Handles leaving a group
     */
    private handleGroupLeave = async (manager: EntityManager, member: ChatMember): Promise<void> => {
        // Check if the person leaving is the last one in the group
        const remainingCount = await this.countMembers(member.chatId, member.userId, manager);
        
        if (remainingCount === 0) {
            // Delete the group
            await manager.softRemove(member.chat);

            // Delete last member
            await this.softDeleteMember(manager, member);
            return;
        }

        // Check if chat needs a new owner
        if (member.role === ChatRole.OWNER) {
            await this.handleNewOwner(manager, member.chatId, member.userId);
        }

        // Handle user leaving the group
        await this.softDeleteMember(manager, member);
    }

    /**
     * Handles transferring ownership to a particular chat member or member with most seniority
     */
    private handleNewOwner = async (manager: EntityManager, chatId: UUID, currentOwnerId: UUID, newOwner?: ChatMember): Promise<void> => {
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

    /**
     * Soft deletes a particular chat member
     */
    private softDeleteMember = async (manager: EntityManager, member: ChatMember): Promise<void> => {
        await manager.softRemove(ChatMember, member);
    }
}