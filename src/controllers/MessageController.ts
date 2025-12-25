import type { Request, Response, NextFunction } from "express";
import { MessageService } from "../services/MessageService.js";
import { handleParams } from "../utils/utils.js";
import { ParamType } from "../enums.js";
import type { User } from "../entities/User.js";

export class MessageController{
    private messageService: MessageService;

    constructor(messageService: MessageService) {
        this.messageService = messageService;
    }

    /**
     * POST /api/chats/:chatId/messages/search
     */
    public searchMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = handleParams(req.params, ParamType.CHAT);
            const { id } = req.user as User;
            const { keyword, type, beforeDate, afterDate, pinned } = req.body;
            const messages = await this.messageService.searchMessages(chatId, id, keyword, type, beforeDate, afterDate, pinned);
            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/messages
     */
    public sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = handleParams(req.params, ParamType.CHAT);
            const { id } = req.user as User;
            const { content, type } = req.body;
            const message = await this.messageService.sendMessage(chatId, id, content, type);
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId
     */
    public updateMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, messageId } = handleParams(req.params, ParamType.MESSAGE);
            const { id } = req.user as User;
            const { content } = req.body;
            await this.messageService.updateMessage(messageId, chatId, id, content);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId/pin
     */
    public pinMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, messageId } = handleParams(req.params, ParamType.MESSAGE);
            const { id } = req.user as User;
            const { pinned } = req.body;
            await this.messageService.pinMessage(messageId, chatId, id, pinned as boolean);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/chats/:chatId/messages/:messageId
     */
    public deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, messageId } = handleParams(req.params, ParamType.MESSAGE);
            const { id } = req.user as User;
            await this.messageService.deleteMessage(messageId, chatId, id);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}