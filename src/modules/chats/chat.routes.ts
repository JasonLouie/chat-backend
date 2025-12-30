import { Router } from "express";
import { ChatController } from "./chat.controller.js";
import { ChatMemberController } from "./members/chat-member.controller.js";
import { MessageController } from "./messages/message.controller.js";
import { createChatMemberRoutes } from "./members/chat-member.routes.js";
import { createMessageRoutes } from "./messages/message.routes.js";
import { handle } from "../../common/utils/route.utils.js";
import { upload } from "../../common/middleware/upload.middleware.js";
import { validationMiddleware } from "../../common/middleware/validation.middleware.js";
import { CreateChatDto, UpdateChatNameDto } from "./chat.dto.js";
import { ChatParamsDto } from "../../common/params/params.dto.js";

export function createChatRoutes(chatController: ChatController, chatMemberController: ChatMemberController, messageController: MessageController) {
    const router = Router();

    router.route("/")
        .get(handle(chatController.getUserChats))
        .post(validationMiddleware(CreateChatDto, "body"), handle(chatController.createChat));

    router.put("/:chatId/group-name", validationMiddleware(ChatParamsDto, "params"), validationMiddleware(UpdateChatNameDto), handle(chatController.updateChatName));

    router.put("/:chatId/group-icon", validationMiddleware(ChatParamsDto, "params"), upload.single("chat_icon"), handle(chatController.updateChatIcon));

    router.use("/:chatId/members", createChatMemberRoutes(chatMemberController));
    router.use("/:chatId/messages", createMessageRoutes(messageController));

    return router;
}
