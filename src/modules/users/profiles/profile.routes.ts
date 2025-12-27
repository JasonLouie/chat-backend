import { Router } from "express";
import type { ProfileController } from "./profile.controller.js";
import { validationMiddleware } from "../../../common/middleware/validationMiddleware.js";
import { GetUserProfileDto, ModifyProfileDto } from "./profile.dto.js";
import { handle } from "../../../common/utils/route.utils.js";

export function createProfileRoutes(profileController: ProfileController) {
    const router = Router();

    router.patch("/", validationMiddleware(ModifyProfileDto, "body", true), handle(profileController.modifyProfile));

    router.get("/me", handle(profileController.getMyProfile));

    router.get("/:userId", validationMiddleware(GetUserProfileDto, "params"), handle(profileController.getUserProfile));

    return router;
}
