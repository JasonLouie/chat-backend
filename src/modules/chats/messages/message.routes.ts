import { Router } from "express";
import type { MessageController } from "./message.controller.js";
import { handle } from "../../../utils/route.utils.js";

export function createMessageRoutes(messageController: MessageController) {
    const router = Router({ mergeParams: true });
    
    router.route("/")
        .get()
        .post(handle(messageController.sendMessage));

    router.get("/search", handle(messageController.searchMessages));

    router.route("/:messageId")
        .patch(handle(messageController.updateMessage))
        .delete(handle(messageController.deleteMessage));

    router.patch("/:messageId/pin", handle(messageController.pinMessage));
    return router;
}