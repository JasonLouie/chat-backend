import { Router } from "express";
import type { AuthController } from "../controllers/AuthController.js";
import { validateLogin, validateModifyEmail, validateModifyPassword, validateModifyUsername, validateRegistration } from "../middleware/validators.js";
import { protect } from "../middleware/auth.js";

export function createAuthRoutes (authController: AuthController) {
    const router = Router();

    router.delete("/", protect, authController.deleteUser);

    router.post("/register", validateRegistration, authController.register);

    router.post("/login", validateLogin, authController.login);

    router.post("/logout", authController.logout);

    router.post("/refresh", authController.refreshTokens);

    router.put("/username", protect, validateModifyUsername, authController.updateUsername);

    router.put("/password", protect, validateModifyPassword, authController.updatePassword);

    router.put("/email", protect, validateModifyEmail, authController.updateEmail);
    return router;
}