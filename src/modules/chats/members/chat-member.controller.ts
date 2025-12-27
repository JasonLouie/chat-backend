import type { Response, NextFunction } from "express";
import { ChatMemberService } from "./chat-member.service.js";
import { EndpointError } from "../../../common/errors/EndpointError.js";
import type { ProtectedRequest } from "../../../common/types/express.types.js";
import { ChatRole } from "../chat.types.js";
import type { ChatMemberParams } from "../../../common/params/params.types.js";

export class ChatMemberController {
    private chatMemberService: ChatMemberService;

    constructor(chatMemberService: ChatMemberService) {
        this.chatMemberService = chatMemberService;
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
    public addMember = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
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
    public updateMember = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
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