import { Router } from "express";
import { ProfileController } from "./profiles/profile.controller.js";
import { UserController } from "./user.controller.js";
import { validationMiddleware } from "../../common/middleware/validationMiddleware.js";
import { ModifyEmailDto, ModifyPasswordDto, ModifyUsernameDto } from "./user.dto.js";
import { createProfileRoutes } from "./profiles/profile.routes.js";

export function createUserRoutes(userController: UserController, profileController: ProfileController) {
    const router = Router();

    router.get("/me", userController.getMe);

    router.put("/username", validationMiddleware(ModifyUsernameDto , "body"), userController.updateUsername);

    router.put("/password", validationMiddleware(ModifyPasswordDto , "body"), userController.updatePassword);

    router.put("/email", validationMiddleware(ModifyEmailDto , "body"), userController.updateEmail);

    // Handle profile routes
    router.use("/:userId/profile", createProfileRoutes(profileController));

    return router;
}