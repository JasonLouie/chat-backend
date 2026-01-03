import type { Response, NextFunction } from "express";
import { ChatService } from "./chat.service.js";
import { requireFile, requireUser } from "../../common/utils/guard.js";
import type { ChatParamsDto } from "../../common/params/params.dto.js";
import type { CreateChatDto, UpdateChatNameDto } from "./chat.dto.js";
import { uploadToCloudinary } from "../../common/utils/upload.utils.js";
import { ImageFolder } from "../../common/types/common.js";
import type { TypedRequest } from "../../common/types/express.types.js";

export class ChatController {
    private chatService: ChatService;

    constructor(chatService: ChatService) {
        this.chatService = chatService;
    }

    /**
     * GET /api/chats
     */
    public getUserChats = async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const chats = await this.chatService.getUserChats(user.id);
            res.status(201).json(chats);
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/chats
     */
    public createChat = async (req: TypedRequest<{}, {}, CreateChatDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { memberIds, name } = req.body;

            const chat = await this.chatService.createChat(user.id, memberIds, name);
            res.status(201).json(chat);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/group-name
     */
    public updateChatName = async (req: TypedRequest<ChatParamsDto, {}, UpdateChatNameDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const { chatId } = req.params;
            const { name } = req.body;

            await this.chatService.modifyChatGroup(chatId, user.id, { name });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/chats/:chatId/group-icon
     */
    public updateChatIcon = async (req: TypedRequest<ChatParamsDto>, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = requireUser(req);
            const file = requireFile(req);

            const { chatId } = req.params;
            const imageUrl = await uploadToCloudinary(file.buffer, ImageFolder.CHAT);

            await this.chatService.modifyChatGroup(chatId, user.id, { imageUrl });
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}