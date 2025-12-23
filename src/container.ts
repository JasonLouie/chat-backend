import { configurePassport } from "./config/passport.js";
import { AuthController } from "./controllers/AuthController.js";
import { ChatController } from "./controllers/ChatController.js";
import { ChatMemberController } from "./controllers/ChatMemberController.js";
import { MessageController } from "./controllers/MessageController.js";
import { ProfileController } from "./controllers/ProfileController.js";
import { AuthService } from "./services/AuthService.js";
import { ChatMemberService } from "./services/ChatMemberService.js";
import { ChatService } from "./services/ChatService.js";
import { MessageService } from "./services/MessageService.js";
import { ProfileService } from "./services/ProfileService.js";
import { TokenService } from "./services/TokenService.js";

// Foundation Services
const authService = new AuthService();
const chatMemberService = new ChatMemberService();
const profileService = new ProfileService();
const tokenService = new TokenService();

// Dependent Services
const chatService = new ChatService(authService, chatMemberService);
const messageService = new MessageService(chatMemberService);

// Configure Passport
configurePassport(authService);

// Initialize Controllers
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
    profileController
}

export type Container = typeof container;