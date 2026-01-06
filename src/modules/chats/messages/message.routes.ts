import { Router } from "express";
import type { MessageController } from "./message.controller.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import { GetMessagesDto, PinMessageDto, SearchMessagesDto, SendTextMessageDto, UpdateMessageDto } from "./messages.dto.js";
import { ChatParamsDto, MessageParamsDto } from "../../../common/params/params.dto.js";

export function createMessageRoutes(messageController: MessageController) {
    const router = Router({ mergeParams: true });
    
    router.get("/", validationMiddleware(ChatParamsDto, "params"), validationMiddleware(GetMessagesDto, "query", true), messageController.getMessages)
        
    router.get("/search", validationMiddleware(ChatParamsDto, "params"), validationMiddleware(SearchMessagesDto, "query", true), messageController.searchMessages);
    
    router.post("/text", validationMiddleware(ChatParamsDto, "params"), validationMiddleware(SendTextMessageDto), messageController.sendText);

    router.post("/image", validationMiddleware(ChatParamsDto, "params"), messageController.sendImage);

    router.route("/:messageId")
        .patch(validationMiddleware(MessageParamsDto, "params"), validationMiddleware(UpdateMessageDto), messageController.updateMessage)
        .delete(validationMiddleware(MessageParamsDto, "params"), messageController.deleteMessage);

    router.patch("/:messageId/pin", validationMiddleware(MessageParamsDto, "params"), validationMiddleware(PinMessageDto), messageController.pinMessage);
    return router;
}