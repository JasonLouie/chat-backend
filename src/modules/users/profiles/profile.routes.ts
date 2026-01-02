import { Router } from "express";
import type { ProfileController } from "./profile.controller.js";
import { ModifyProfileDto } from "./profile.dto.js";
import { validationMiddleware } from "../../../common/middleware/validation.middleware.js";
import { handle } from "../../../common/utils/route.utils.js";
import { upload } from "../../../common/middleware/upload.middleware.js";
import { UserParamsDto } from "../../../common/params/params.dto.js";

export function createProfileRoutes(profileController: ProfileController) {
    const router = Router();
    
    router.route("/me/profile") 
        .get(handle(profileController.getMyProfile))
        .patch(validationMiddleware(ModifyProfileDto, "body", true), handle(profileController.modifyProfile));

    router.post("/me/profile/upload-avatar", upload.single("avatar"), handle(profileController.updateProfilePicture));

    router.get("/:userId/profile", validationMiddleware(UserParamsDto, "params"), handle(profileController.getUserProfile));

    return router;
}
