import { ChatMemberService } from "../services/ChatMemberService.js";
import { ChatService } from "../services/ChatService.js";

export class ChatController {
    private chatService: ChatService;
    private chatMemberService: ChatMemberService;

    constructor(chatService: ChatService, chatMemberService: ChatMemberService) {
        this.chatService = chatService;
        this.chatMemberService = chatMemberService;
    }
}