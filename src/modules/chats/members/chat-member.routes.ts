import { Router } from "express";
import type { ChatMemberController } from "./chat-member.controller.js";
import { handle } from "../../../common/utils/route.utils.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import { ChatParamsDto, MemberParamsDto } from "../../../common/params/params.dto.js";
import { UpdateMemberDto } from "./chat-member.dto.js";

export function createChatMemberRoutes(chatMemberController: ChatMemberController) {
    const router = Router({ mergeParams: true });
    
    router.get("/", validationMiddleware(ChatParamsDto, "params"), handle(chatMemberController.getMembers));

    router.route("/:memberId")
        .post(validationMiddleware(MemberParamsDto, "params"), handle(chatMemberController.addMember))
        .patch(validationMiddleware(MemberParamsDto, "params"), validationMiddleware(UpdateMemberDto), handle(chatMemberController.updateMember))
        .delete(validationMiddleware(MemberParamsDto, "params"), handle(chatMemberController.deleteMember));

    return router;
}
