import { Router } from "express";
import { ChatController } from "./chat.controller.js";
import { ChatMemberController } from "./members/chat-member.controller.js";
import { MessageController } from "./messages/message.controller.js";
import { createChatMemberRoutes } from "./members/chat-member.routes.js";
import { createMessageRoutes } from "./messages/message.routes.js";

export function createChatRoutes(chatController: ChatController, chatMemberController: ChatMemberController, messageController: MessageController) {
    const router = Router();

    router.route("/")
        .get(chatController.getUserChats)
        .post(chatController.createChat)

    router.patch("/:chatId", chatController.modifyChatGroup);

    router.use("/:chatId/members", createChatMemberRoutes(chatMemberController));
    router.use("/:chatId/messages", createMessageRoutes(messageController));

    return router;
}
