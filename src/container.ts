import { configurePassport } from "./config/passport.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { ChatController } from "./modules/chats/chat.controller.js";
import { ChatMemberController } from "./modules/chats/members/chat-member.controller.js";
import { MessageController } from "./modules/chats/messages/message.controller.js";
import { ProfileController } from "./modules/users/profiles/profile.controller.js";

import { AuthService } from "./modules/auth/auth.service.js";
import { ChatMemberService } from "./modules/chats/members/chat-member.service.js";
import { ChatService } from "./modules/chats/chat.service.js";
import { MessageService } from "./modules/chats/messages/message.service.js";
import { ProfileService } from "./modules/users/profiles/profile.service.js";
import { TokenService } from "./modules/auth/tokens/token.service.js";
import { UserService } from "./modules/users/user.service.js";
import { UserController } from "./modules/users/user.controller.js";

// Foundation Services
const userService = new UserService();
const profileService = new ProfileService();
const tokenService = new TokenService();

// Dependent Services
const authService = new AuthService(userService);
const chatMemberService = new ChatMemberService(userService);
const messageService = new MessageService(chatMemberService);
const chatService = new ChatService(userService, chatMemberService, messageService);

// Configure Passport
configurePassport(authService);

// Initialize Controllers
const userController = new UserController(userService);
const authController = new AuthController(authService, profileService, tokenService);
const chatController = new ChatController(chatService);
const chatMemberController = new ChatMemberController(chatMemberService);
const messageController = new MessageController(messageService);
const profileController = new ProfileController(profileService);

export const container = {
    authController,
    chatController,
    chatMemberController,
    messageController,
    profileController,
    userController
}

export type Container = typeof container;