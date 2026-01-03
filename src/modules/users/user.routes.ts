import { Router } from "express";
import { ProfileController } from "./profiles/profile.controller.js";
import { UserController } from "./user.controller.js";
import { validationMiddleware } from "../../common/middleware/validation.middleware.js";
import { UpdateEmailDto, UpdatePasswordDto, UpdateUsernameDto } from "./user.dto.js";
import { createProfileRoutes } from "./profiles/profile.routes.js";

export function createUserRoutes(userController: UserController, profileController: ProfileController) {
    const router = Router();

    // Access the settings dashboard (user's email)
    router.get("/me", userController.getMe);

    router.patch("/username", validationMiddleware(UpdateUsernameDto , "body"), userController.updateUsername);

    router.patch("/password", validationMiddleware(UpdatePasswordDto , "body"), userController.updatePassword);

    router.patch("/email", validationMiddleware(UpdateEmailDto , "body"), userController.updateEmail);

    // Handle profile routes
    router.use("/", createProfileRoutes(profileController));

    return router;
}