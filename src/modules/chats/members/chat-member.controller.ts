import type { Request, Response, NextFunction } from "express";
import { ChatMemberService } from "../modules/chats/members/chat-member.service.js";
import { EndpointError } from "../classes/EndpointError.js";
import type { User } from "../modules/users/user.entity.js";
import { ChatRole, ParamType } from "../enums.js";
import { handleParams } from "../utils/utils.js";

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
            const { chatId, memberId } = handleParams(req.params, ParamType.MEMBER);
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
            const { chatId, memberId } = handleParams(req.params, ParamType.MEMBER);
            const { id } = req.user as User;
            const member = await this.chatMemberService.addMember(chatId, id, memberId);
            res.status(201).json(member);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/:memberId
     */
    public updateMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, memberId } = handleParams(req.params, ParamType.MEMBER);
            const { id } = req.user as User;
            const { role } = req.body;

            if (role === ChatRole.OWNER) {
                await this.chatMemberService.transferOwnership(chatId, id, memberId);
                res.sendStatus(204);
            }
            
            throw new EndpointError(400, "Invalid role update.");
        } catch (err) {
            next(err);
        }
    }
}