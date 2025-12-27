import type { Response, NextFunction } from "express";
import { MessageService } from "./message.service.js";
import type { ChatParams, MessageParams } from "../../../common/params/params.types.js";
import type { GetChatMessagesQuery, SearchMessageQuery } from "./message.types.js";
import type { ProtectedRequest } from "../../../common/types/express.types.js";

export class MessageController{
    private messageService: MessageService;

    constructor(messageService: MessageService) {
        this.messageService = messageService;
    }

    /**
     * GET /api/chats/:chatId/messages
     */
    public getChatMessages = async (req: ProtectedRequest<ChatParams, any, any, GetChatMessagesQuery>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            const { cursor, limit } = req.query;
            const messages = await this.messageService.searchMessages(
                chatId,
                userId,
                {
                    beforeDate: cursor,
                    limit
                }
            );
            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/chats/:chatId/messages/search
     */
    public searchMessages = async (req: ProtectedRequest<ChatParams, any, any, SearchMessageQuery>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            const messages = await this.messageService.searchMessages(chatId, userId, req.query);
            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/messages
     */
    public sendMessage = async (req: ProtectedRequest<ChatParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            const { content, type } = req.body;
            const message = await this.messageService.sendMessage(chatId, userId, content, type);
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId
     */
    public updateMessage = async (req: ProtectedRequest<MessageParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, messageId } = req.params;
            const userId = req.user.id;
            const { content } = req.body;
            await this.messageService.updateMessage(messageId, chatId, userId, content);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId/pin
     */
    public pinMessage = async (req: ProtectedRequest<MessageParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, messageId } = req.params;
            const userId = req.user.id;
            const { pinned } = req.body;
            await this.messageService.pinMessage(messageId, chatId, userId, pinned as boolean);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/chats/:chatId/messages/:messageId
     */
    public deleteMessage = async (req: ProtectedRequest<MessageParams>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, messageId } = req.params;
            const userId = req.user.id;
            await this.messageService.deleteMessage(messageId, chatId, userId);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}