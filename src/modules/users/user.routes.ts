import { Router } from "express";
import { ProfileController } from "./profiles/profile.controller.js";
import { UserController } from "./user.controller.js";
import { validationMiddleware } from "../../common/middleware/validationMiddleware.js";
import { ModifyEmailDto, ModifyPasswordDto, ModifyUsernameDto } from "./user.dto.js";
import { createProfileRoutes } from "./profiles/profile.routes.js";
import { handle } from "../../common/utils/route.utils.js";

export function createUserRoutes(userController: UserController, profileController: ProfileController) {
    const router = Router();

    router.get("/me", handle(userController.getMe));

    router.put("/username", validationMiddleware(ModifyUsernameDto , "body"), handle(userController.updateUsername));

    router.put("/password", validationMiddleware(ModifyPasswordDto , "body"), handle(userController.updatePassword));

    router.put("/email", validationMiddleware(ModifyEmailDto , "body"), handle(userController.updateEmail));

    // Handle profile routes
    router.use("/:userId/profile", createProfileRoutes(profileController));

    return router;
}