import type { Response, NextFunction } from "express";
import { ChatMemberService } from "./chat-member.service.js";
import { EndpointError } from "../../../common/errors/EndpointError.js";
import type { ProtectedRequest } from "../../../common/types/express.types.js";
import { ChatRole } from "../chat.types.js";
import type { ChatMemberParams, ChatParams } from "../../../common/params/params.types.js";
import type { UpdateMemberBody } from "./chat-member.types.js";

export class ChatMemberController {
    constructor(
        private chatMemberService: ChatMemberService
    ) {}

    /**
     * GET /api/chats/:chatId/members 
     */
    public getMembers = async (req: ProtectedRequest<ChatParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const { chatId } = req.params;
            
            const members = await this.chatMemberService.getChatMembers(chatId, userId);
            res.json(members);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/chats/:chatId/members/:memberId
     */
    public deleteMember = async (req: ProtectedRequest<ChatMemberParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, memberId } = req.params;
            const userId = req.user.id;

            if (memberId === userId) {
                await this.chatMemberService.leaveChat(chatId, userId);
            } else {
                await this.chatMemberService.removeMember(chatId, userId, memberId);
            }
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/members/:memberId
     */
    public addMember = async (req: ProtectedRequest<ChatMemberParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, memberId } = req.params;
            const userId = req.user.id;

            const member = await this.chatMemberService.addMember(chatId, userId, memberId);
            res.status(201).json(member);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/:memberId
     */
    public updateMember = async (req: ProtectedRequest<ChatMemberParams, any, UpdateMemberBody>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, memberId } = req.params;
            const userId = req.user.id;
            const { role } = req.body;

            if (role === ChatRole.OWNER) {
                await this.chatMemberService.transferOwnership(chatId, userId, memberId);
                res.sendStatus(204);
            }
            
            throw new EndpointError(400, "Invalid role update.");
        } catch (err) {
            next(err);
        }
    }
}