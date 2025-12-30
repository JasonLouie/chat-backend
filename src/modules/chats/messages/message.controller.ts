import type { Response, NextFunction } from "express";
import { MessageService } from "./message.service.js";
import type { ChatParams, MessageParams } from "../../../common/params/params.types.js";
import { MessageType, type GetMessagesQuery, type PinMessageBody, type SearchMessagesQuery, type SendMessageBody, type UpdateMessageBody } from "./message.types.js";
import type { ProtectedRequest } from "../../../common/types/express.types.js";
import { EndpointError } from "../../../common/errors/EndpointError.js";
import { uploadToCloudinary } from "../../../common/utils/upload.utils.js";
import { ImageFolder } from "../../../common/types/common.js";

export class MessageController{
    private messageService: MessageService;

    constructor(messageService: MessageService) {
        this.messageService = messageService;
    }

    /**
     * GET /api/chats/:chatId/messages
     */
    public getMessages = async (req: ProtectedRequest<ChatParams, any, any, GetMessagesQuery>, res: Response, next: NextFunction): Promise<void> => {
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
    public searchMessages = async (req: ProtectedRequest<ChatParams, any, any, SearchMessagesQuery>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            const { keyword, type, beforeDate, afterDate, pinned, limit } = req.query;
            
            const messages = await this.messageService.searchMessages(chatId, userId, { keyword, type, beforeDate, afterDate, pinned, limit });
            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/messages
     */
    public sendMessage = async (req: ProtectedRequest<ChatParams, any, SendMessageBody>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { type } = req.body;
            let content = req.body.content;
            if (type === MessageType.IMAGE) {
                if (!req.file) throw new EndpointError(400, "No file uploaded.");
                content = await uploadToCloudinary(req.file.buffer, ImageFolder.MESSAGE);
            }

            const { chatId } = req.params;
            const userId = req.user.id;

            const message = await this.messageService.sendMessage(chatId, userId, content, type);
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId
     */
    public updateMessage = async (req: ProtectedRequest<MessageParams, any, UpdateMessageBody>, res: Response, next: NextFunction): Promise<void> => {
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
    public pinMessage = async (req: ProtectedRequest<MessageParams, any, PinMessageBody>, res: Response, next: NextFunction): Promise<void> => {
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