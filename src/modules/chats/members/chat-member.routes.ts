import { Router } from "express";
import type { ChatMemberController } from "./chat-member.controller.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import { ChatParamsDto, MemberParamsDto } from "../../../common/params/params.dto.js";
import { UpdateMemberDto } from "./chat-member.dto.js";

export function createChatMemberRoutes(chatMemberController: ChatMemberController) {
    const router = Router({ mergeParams: true });
    
    router.get("/", validationMiddleware(ChatParamsDto, "params"), chatMemberController.getMembers);

    router.route("/:memberId")
        .post(validationMiddleware(MemberParamsDto, "params"), chatMemberController.addMember)
        .patch(validationMiddleware(MemberParamsDto, "params"), validationMiddleware(UpdateMemberDto), chatMemberController.updateMember)
        .delete(validationMiddleware(MemberParamsDto, "params"), chatMemberController.deleteMember);

    return router;
}
