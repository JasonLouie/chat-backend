import { Router } from "express";
import type { ChatMemberController } from "./chat-member.controller.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import { ChatParamsDto, MemberParamsDto } from "../../../common/params/params.dto.js";
import { AddMembersDto, UpdateMemberDto } from "./chat-member.dto.js";

export function createChatMemberRoutes(chatMemberController: ChatMemberController) {
    const router = Router({ mergeParams: true });
    
    router.route("/")
        .get(validationMiddleware(ChatParamsDto, "params"), chatMemberController.getMembers)
        .post(validationMiddleware(ChatParamsDto, "params"), validationMiddleware(AddMembersDto), chatMemberController.addMembers);

    router.route("/:memberId")
        .patch(validationMiddleware(MemberParamsDto, "params"), validationMiddleware(UpdateMemberDto), chatMemberController.updateMember)
        .delete(validationMiddleware(MemberParamsDto, "params"), chatMemberController.deleteMember);

    return router;
}
