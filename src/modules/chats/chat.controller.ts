import type { Response, NextFunction } from "express";
import { ChatService } from "./chat.service.js";
import type { ProtectedRequest } from "../../common/types/express.types.js";
import { EndpointError } from "../../common/errors/EndpointError.js";
import type { ChatParams } from "../../common/params/params.types.js";

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
            const { memberIds, name } = req.body;

            const chat = await this.chatService.createChat(userId, memberIds, name);
            res.status(201).json(chat);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/chats/:chatId/group-name
     */
    public updateChatName = async (req: ProtectedRequest<ChatParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            const { name } = req.body;

            await this.chatService.modifyChatGroup(chatId, userId, { name });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/chats/:chatId/group-icon
     */
    public updateChatIcon = async (req: ProtectedRequest<ChatParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.file) throw new EndpointError(400, "No file uploaded.");

            const { chatId } = req.params;
            const userId = req.user.id;
            const { imageUrl } = req.body;

            await this.chatService.modifyChatGroup(chatId, userId, { imageUrl });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}