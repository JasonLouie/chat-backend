import type { Request, Response, NextFunction } from "express";
import { ChatService } from "../services/ChatService.js";
import type { User } from "../entities/User.js";
import { EndpointError } from "../classes/EndpointError.js";

export class ChatController {
    private chatService: ChatService;

    constructor(chatService: ChatService) {
        this.chatService = chatService;
    }

    /**
     * Returns all chats belonging to a user
     */
    public getUserChats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.user as User;
            const chats = await this.chatService.getUserChats(id);
            res.status(201).json(chats);
        } catch (err) {
            next(err);
        }
    }

    public createChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.user as User;
            const { memberIds, name, imageUrl } = req.body;

            const chat = await this.chatService.createChat(id, memberIds, name, imageUrl);
            res.status(201).json(chat);
        } catch (err) {
            next(err);
        }
    }

    public modifyChatGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { chatId } = req.params;
            if (!chatId) throw new EndpointError(400, "Chat ID is required.");
            const { id } = req.user as User;
            const { name, imageUrl } = req.body;

            await this.chatService.modifyChatGroup(chatId, id, name, imageUrl);
            res.sendStatus(204);
        } catch (err) {
            next(err);
        }
    }
}