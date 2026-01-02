import type { Request, Response, NextFunction } from "express";
import { MessageService } from "./message.service.js";
import { MessageType } from "./message.types.js";
import { uploadToCloudinary } from "../../../common/utils/upload.utils.js";
import { ImageFolder } from "../../../common/types/common.js";
import type { ChatParamsDto, MessageParamsDto } from "../../../common/params/params.dto.js";
import type { GetMessagesDto, PinMessageDto, SearchMessagesDto, SendMessageDto, UpdateMessageDto } from "./messages.dto.js";
import { requireFile, requireUser } from "../../../common/utils/guard.js";

export class MessageController{
    private messageService: MessageService;

    constructor(messageService: MessageService) {
        this.messageService = messageService;
    }

    /**
     * GET /api/chats/:chatId/messages
     */
    public getMessages = async (req: Request<ChatParamsDto, {}, {}, GetMessagesDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const user = requireUser(req);
            const { cursor, limit } = req.query;

            const messages = await this.messageService.searchMessages(
                chatId,
                user.id,
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
    public searchMessages = async (req: Request<ChatParamsDto, {}, {}, SearchMessagesDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            const user = requireUser(req);
            const { keyword, type, beforeDate, afterDate, pinned, limit } = req.query;
            
            const messages = await this.messageService.searchMessages(chatId, user.id, { keyword, type, beforeDate, afterDate, pinned, limit });
            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/messages
     */
    public sendMessage = async (req: Request<ChatParamsDto, {}, SendMessageDto, {}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { type } = req.body;
            let content = req.body.content;
            if (type === MessageType.IMAGE) {
                const file = requireFile(req);
                content = await uploadToCloudinary(file.buffer, ImageFolder.MESSAGE);
            }

            const { chatId } = req.params;
            const user = requireUser(req);

            const message = await this.messageService.sendMessage(chatId, user.id, content, type);
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId
     */
    public updateMessage = async (req: Request<MessageParamsDto, {}, UpdateMessageDto, {}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId, messageId } = req.params;
            const user = requireUser(req);
            const { content } = req.body;

            await this.messageService.updateMessage(messageId, chatId, user.id, content);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId/pin
     */
    public pinMessage = async (req: Request<MessageParamsDto, {}, PinMessageDto, {}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId, messageId } = req.params;
            const { pinned } = req.body;

            await this.messageService.pinMessage(messageId, chatId, user.id, pinned as boolean);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/chats/:chatId/messages/:messageId
     */
    public deleteMessage = async (req: Request<MessageParamsDto, {}, {}, {}>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId, messageId } = req.params;

            await this.messageService.deleteMessage(messageId, chatId, user.id);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}