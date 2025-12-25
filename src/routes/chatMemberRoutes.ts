import { Router } from "express";
import type { ChatMemberController } from "../controllers/ChatMemberController.js";

export function createMemberRoutes(chatMemberController: ChatMemberController) {
    const router = Router({ mergeParams: true });
    
    router.route("/:memberId")
        .post(chatMemberController.addMember)
        .patch(chatMemberController.updateMember)
        .delete(chatMemberController.deleteMember);

    return router;
}
