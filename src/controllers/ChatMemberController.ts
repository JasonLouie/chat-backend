import type { Request, Response, NextFunction } from "express";
import { ChatMemberService } from "../services/ChatMemberService.js";
import type { ChatParams } from "../types/common.js";
import { EndpointError } from "../classes/EndpointError.js";
import type { User } from "../entities/User.js";

export class ChatMemberController {
    private chatMemberService: ChatMemberService;

    constructor(chatMemberService: ChatMemberService) {
        this.chatMemberService = chatMemberService;
    }

    /**
     * DELETE /api/chats/:chatId/members/:memberId
     */
    public deleteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, memberId } = this.handleParams(req.params);
            const { id } = req.user as User;

            if (memberId === id) {
                await this.chatMemberService.leaveChat(chatId, id);
            } else {
                await this.chatMemberService.removeMember(chatId, id, memberId);
            }
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/members/:memberId
     */
    public addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, memberId } = this.handleParams(req.params);
            const { id } = req.user as User;
            
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/:memberId
     */
    public transferOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, memberId } = this.handleParams(req.params);
            const { id } = req.user as User;
            
        } catch (err) {
            next(err);
        }
    }

    /**
     * Ensures that chatId and memberId are provided
     */
    private handleParams = (params: ChatParams) => {
        const { chatId, memberId } = params;
        if (!chatId) throw new EndpointError(400, "Chat ID is required.");
        if (!memberId) throw new EndpointError(400, "Member ID is required.");
        return { chatId, memberId };
    }
}