import { Router } from "express";
import type { ChatMemberController } from "./chat-member.controller.js";
import { handle } from "../../../common/utils/route.utils.js";

export function createChatMemberRoutes(chatMemberController: ChatMemberController) {
    const router = Router({ mergeParams: true });
    
    router.route("/:memberId")
        .post(handle(chatMemberController.addMember))
        .patch(handle(chatMemberController.updateMember))
        .delete(handle(chatMemberController.deleteMember));

    return router;
}
