import { Router } from "express";
import type { MessageController } from "./message.controller.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import { GetMessagesDto, PinMessageDto, SearchMessagesDto, SendMessageDto, UpdateMessageDto } from "./messages.dto.js";
import { ChatParamsDto, MessageParamsDto } from "../../../common/params/params.dto.js";

export function createMessageRoutes(messageController: MessageController) {
    const router = Router({ mergeParams: true });
    
    router.route("/")
        .get(validationMiddleware(ChatParamsDto, "params"), validationMiddleware(GetMessagesDto, "query", true), messageController.getMessages)
        .post(validationMiddleware(ChatParamsDto, "params"), validationMiddleware(SendMessageDto), messageController.sendMessage);

    router.get("/search", validationMiddleware(ChatParamsDto, "params"), validationMiddleware(SearchMessagesDto, "query", true), messageController.searchMessages);

    router.route("/:messageId")
        .patch(validationMiddleware(MessageParamsDto, "params"), validationMiddleware(UpdateMessageDto), messageController.updateMessage)
        .delete(validationMiddleware(MessageParamsDto, "params"), messageController.deleteMessage);

    router.patch("/:messageId/pin", validationMiddleware(MessageParamsDto, "params"), validationMiddleware(PinMessageDto), messageController.pinMessage);
    return router;
}