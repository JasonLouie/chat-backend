import { Router } from "express";
import type { Container } from "../container.js";
import { createAuthRoutes } from "./authRoutes.js";
import { protect } from "../middleware/auth.js";
import { createProfileRoutes } from "./profileRoutes.js";

export function createRoutes(container: Container) {
    const router = Router();

    const { authController, chatController, chatMemberController, messageController, profileController } = container;

    // Mount Routes

    // Auth
    router.use("/auth", createAuthRoutes(authController));

    // Profile
    router.use("/profiles", protect, createProfileRoutes(profileController));

    // Chat, Messages, and Members
    router.use("/chat", protect, );
    return router;
}