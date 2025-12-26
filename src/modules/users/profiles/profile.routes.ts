import { Router } from "express";
import type { ProfileController } from "./profile.controller.js";
import { validationMiddleware } from "../../../common/middleware/validationMiddleware.js";
import { ModifyProfileDto } from "./profile.dto.js";

export function createProfileRoutes(profileController: ProfileController) {
    const router = Router();

    router.patch("/", validationMiddleware(ModifyProfileDto, "body", true), profileController.modifyProfile);

    router.get("/me", profileController.getMyProfile);

    router.get("/:userId", profileController.getUserProfile);

    return router;
}
