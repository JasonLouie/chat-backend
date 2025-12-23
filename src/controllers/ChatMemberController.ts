import { ChatMemberService } from "../services/ChatMemberService.js";

export class ChatMemberController {
    private chatMemberService: ChatMemberService;

    constructor(chatMemberService: ChatMemberService) {
        this.chatMemberService = chatMemberService;
    }
}