import type { Response, NextFunction } from "express";
import { ChatMemberService } from "./chat-member.service.js";
import { EndpointError } from "../../../common/errors/EndpointError.js";
import { ChatRole } from "../chat.types.js";
import { requireUser } from "../../../common/utils/guard.js";
import type { ChatParamsDto, MemberParamsDto } from "../../../common/params/params.dto.js";
import type { UpdateMemberDto } from "./chat-member.dto.js";
import type { TypedRequest } from "../../../common/types/express.types.js";

export class ChatMemberController {
    constructor(
        private chatMemberService: ChatMemberService
    ) {}

    /**
     * GET /api/chats/:chatId/members 
     */
    public getMembers = async (req: TypedRequest<ChatParamsDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId } = req.params;
            
            const members = await this.chatMemberService.getChatMembers(chatId, user.id);
            res.json(members);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/chats/:chatId/members/:memberId
     */
    public deleteMember = async (req: TypedRequest<MemberParamsDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId, memberId } = req.params;

            if (memberId === user.id) {
                await this.chatMemberService.leaveChat(chatId, user.id);
            } else {
                await this.chatMemberService.removeMember(chatId, user.id, memberId);
            }
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/members/:memberId
     */
    public addMember = async (req: TypedRequest<MemberParamsDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId, memberId } = req.params;

            const member = await this.chatMemberService.addMember(chatId, user.id, memberId);
            res.status(201).json(member);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/:memberId
     */
    public updateMember = async (req: TypedRequest<MemberParamsDto, {}, UpdateMemberDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId, memberId } = req.params;
            const { role } = req.body;

            if (role === ChatRole.OWNER) {
                await this.chatMemberService.transferOwnership(chatId, user.id, memberId);
                res.sendStatus(204);
            }
            
            throw new EndpointError(400, "Invalid role update.");
        } catch (err) {
            next(err);
        }
    }
}