import type { Response, NextFunction } from "express";
import { MessageService } from "./message.service.js";
import { MessageType } from "./message.types.js";
import uploadUtils from "../../../common/utils/upload.utils.js";
import { ImageFolder } from "../../../common/types/common.js";
import type { ChatParamsDto, MessageParamsDto } from "../../../common/params/params.dto.js";
import type { GetMessagesDto, PinMessageDto, SearchMessagesDto, SendTextMessageDto, UpdateMessageDto } from "./messages.dto.js";
import { requireFile, requireUser } from "../../../common/utils/guard.js";
import type { TypedRequest } from "../../../common/types/express.types.js";

export class MessageController{
    private messageService: MessageService;

    constructor(messageService: MessageService) {
        this.messageService = messageService;
    }

    /**
     * GET /api/chats/:chatId/messages
     */
    public getMessages = async (req: TypedRequest<ChatParamsDto, {}, {}, GetMessagesDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId } = req.params;
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
    public searchMessages = async (req: TypedRequest<ChatParamsDto, {}, {}, SearchMessagesDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId } = req.params;
            const { keyword, type, beforeDate, afterDate, pinned, limit } = req.query;
            
            const messages = await this.messageService.searchMessages(chatId, user.id, { keyword, type, beforeDate, afterDate, pinned, limit });
            
            res.json(messages);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/messages/text
     */
    public sendText = async (req: TypedRequest<ChatParamsDto, {}, SendTextMessageDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { content } = req.body;
            const { chatId } = req.params;

            const message = await this.messageService.sendMessage(chatId, user.id, content, MessageType.TEXT);
            
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats/:chatId/messages/image
     */
    public sendImage = async (req: TypedRequest<ChatParamsDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const file = requireFile(req);
            const { chatId } = req.params;

            const content = await uploadUtils.uploadToCloudinary(file.buffer, ImageFolder.MESSAGE);
            const message = await this.messageService.sendMessage(chatId, user.id, content, MessageType.IMAGE);
            
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId
     */
    public updateMessage = async (req: TypedRequest<MessageParamsDto, {}, UpdateMessageDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId, messageId } = req.params;
            const { newContent } = req.body;

            await this.messageService.updateMessage(messageId, chatId, user.id, newContent);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/messages/:messageId/pin
     */
    public pinMessage = async (req: TypedRequest<MessageParamsDto, {}, PinMessageDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId, messageId } = req.params;
            const { pinned } = req.body;

            await this.messageService.pinMessage(messageId, chatId, user.id, pinned);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/chats/:chatId/messages/:messageId
     */
    public deleteMessage = async (req: TypedRequest<MessageParamsDto>, res: Response, next: NextFunction): Promise<void> => {
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