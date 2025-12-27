import type { Response, NextFunction } from "express";
import { ChatService } from "./chat.service.js";
import type { ProtectedRequest } from "../../common/types/express.types.js";

export class ChatController {
    private chatService: ChatService;

    constructor(chatService: ChatService) {
        this.chatService = chatService;
    }

    /**
     * GET /api/chats
     */
    public getUserChats = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const chats = await this.chatService.getUserChats(userId);
            res.status(201).json(chats);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats
     */
    public createChat = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const { memberIds, name, imageUrl } = req.body;

            const chat = await this.chatService.createChat(userId, memberIds, name, imageUrl);
            res.status(201).json(chat);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId
     */
    public modifyChatGroup = async (req: ProtectedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            const { name, imageUrl } = req.body;

            await this.chatService.modifyChatGroup(chatId, userId, name, imageUrl);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}