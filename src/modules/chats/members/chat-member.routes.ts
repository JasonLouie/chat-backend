import { Router } from "express";
import type { ChatMemberController } from "./chat-member.controller.js";

export function createChatMemberRoutes(chatMemberController: ChatMemberController) {
    const router = Router({ mergeParams: true });
    
    router.route("/:memberId")
        .post(chatMemberController.addMember)
        .patch(chatMemberController.updateMember)
        .delete(chatMemberController.deleteMember);

    return router;
}
