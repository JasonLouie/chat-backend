import { Router } from "express";
import type { MessageController } from "./message.controller.js";
import { handle } from "../../../common/utils/route.utils.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import { GetMessagesDto, PinMessageDto, SearchMessagesDto, SendMessageDto, UpdateMessageDto } from "./messages.dto.js";
import { ChatParamsDto, MessageParamsDto } from "../../../common/params/params.dto.js";

export function createMessageRoutes(messageController: MessageController) {
    const router = Router({ mergeParams: true });
    
    router.route("/")
        .get(validationMiddleware(ChatParamsDto, "params"), validationMiddleware(GetMessagesDto, "query", true), handle(messageController.getMessages))
        .post(validationMiddleware(ChatParamsDto, "params"), validationMiddleware(SendMessageDto), handle(messageController.sendMessage));

    router.get("/search", validationMiddleware(ChatParamsDto, "params"), validationMiddleware(SearchMessagesDto, "query", true), handle(messageController.searchMessages));

    router.route("/:messageId")
        .patch(validationMiddleware(MessageParamsDto, "params"), validationMiddleware(UpdateMessageDto), handle(messageController.updateMessage))
        .delete(validationMiddleware(MessageParamsDto, "params"), handle(messageController.deleteMessage));

    router.patch("/:messageId/pin", validationMiddleware(MessageParamsDto, "params"), validationMiddleware(PinMessageDto), handle(messageController.pinMessage));
    return router;
}