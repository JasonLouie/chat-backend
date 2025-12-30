import { Router } from "express";
import type { Container } from "../container.js";
import { createAuthRoutes } from "../modules/auth/auth.routes.js";
import { protect } from "../common/middleware/auth.middleware.js";
import { createUserRoutes } from "../modules/users/user.routes.js";
import { createChatRoutes } from "../modules/chats/chat.routes.js";

export function createRoutes(container: Container) {
    const router = Router();

    const { authController, userController, profileController, chatController, chatMemberController, messageController } = container;

    // Mount Routes

    // Auth
    router.use("/auth", createAuthRoutes(authController));

    // User
    router.use("/users", protect, createUserRoutes(userController, profileController));

    // Chat, Messages, and Members
    router.use("/chats", protect, createChatRoutes(chatController, chatMemberController, messageController));
    return router;
}