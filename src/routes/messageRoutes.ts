import { Router } from "express";
import type { MessageController } from "../controllers/MessageController.js";

export function createMemberRoutes(messageController: MessageController) {
    const router = Router({ mergeParams: true });
    
    router.post("/", messageController.sendMessage);

    router.post("/search", messageController.searchMessages);

    router.route("/:messageId")
        .patch(messageController.updateMessage)
        .delete(messageController.deleteMessage);

    router.patch("/:messageId/pin", messageController.pinMessage);
    return router;
}