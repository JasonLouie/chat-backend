import { Router } from "express";
import type { Container } from "../container.js";
import { createAuthRoutes } from "./authRoutes.js";
import { protect } from "../middleware/auth.js";

export function createRoutes(container: Container) {
    const router = Router();

    const { authController, chatController, chatMemberController, messageController, profileController } = container;

    // Mount Routes

    // Auth
    router.use("/auth", createAuthRoutes(authController));

    // Profile
    router.use("/profiles", protect, );

    // Chat, Messages, and Members
    return router;
}