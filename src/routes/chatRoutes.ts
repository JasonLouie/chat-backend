import { Router } from "express";
import type { ChatController } from "../controllers/ChatController.js";
import type { ChatMemberController } from "../controllers/ChatMemberController.js";
import type { MessageController } from "../controllers/MessageController.js";

export function createChatRoutes(chatController: ChatController, chatMemberController: ChatMemberController, messageController: MessageController) {
    const router = Router();

    router.route("/")
        .get(chatController.getUserChats)
        .post(chatController.createChat)

    router.route("/:chatId")
        .get()
        .patch(chatController.modifyChatGroup);

    router.use("/:chatId/members", );
    router.use("/:chatId/messages", );

    return router;
}
