import { Router } from "express";
import type { AuthController } from "./auth.controller.js";
import { validationMiddleware } from "../../common/middleware/validation.middleware.js";
import { LoginDto, RegisterDto } from "./auth.dto.js";
import { authenticateUser } from "../../common/middleware/auth.middleware.js";

export function createAuthRoutes (authController: AuthController) {
    const router = Router();

    router.post("/register", validationMiddleware(RegisterDto, "body"), authController.register);

    router.post("/login", validationMiddleware(LoginDto, "body"), authenticateUser, authController.login);

    router.post("/logout", authController.logout);

    router.post("/refresh", authController.refreshTokens);
    return router;
}