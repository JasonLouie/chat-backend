import { createRequest, createResponse } from "node-mocks-http";
import { MessageController } from "../../src/controllers/MessageController";
import { MessageService } from "../../src/services/MessageService";
import { EndpointError } from "../../src/classes/EndpointError";

describe("MessageController", () => {
    let messageController: MessageController;
    let mockMessageService: jest.Mocked<MessageService>;

    beforeEach(() => {
        // Create fake service with Jest Mocks
        // Cast it to 'unkown' to bypass private property checks
        mockMessageService = {
            sendMessage: jest.fn(),
            updateMessage: jest.fn(),
            pinMessage: jest.fn(),
            deleteMessage: jest.fn(),
            searchMessages: jest.fn()
        } as unknown as jest.Mocked<MessageService>;

        // Inject Fake Service into the Real Controller
        messageController = new MessageController(mockMessageService);
    });

    describe("searchMessages", () => {
        it("should return 200 and the list of messages on success", async () => {

        });

        
    });

    describe("sendMessage", () => {
        it("should return 201 and the new message on success", async () => {
            const req = createRequest({
                method: "POST",
                user: { id: "user-123" },
                params: { chatId: "chat-abc" },
                body: { content: "Hello World", type: "text" }
            });
            const res = createResponse();
            const next = jest.fn();

            // Mock the service return value
            const mockResult = { id: "msg-1", content: "Hello World" };
            mockMessageService.sendMessage.mockResolvedValue(mockResult as any);

            // Act
            await messageController.sendMessage(req, res, next);

            // Assert
            expect(mockMessageService.sendMessage).toHaveBeenCalledWith(
                "chat-abc",
                "user-123",
                "Hello World",
                "text"
            );
            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockResult);
        });

        it("should call next(err) if service throws an error", async () => {
            const req = createRequest({
                user: { id: "user-1" },
                params: { chatId: "chat-1" },
                body: { content: "Hi" }
            });
            const res = createResponse();
            const next = jest.fn();

            // Simulate Service Failure
            const error = new EndpointError(403, "Not allowed");
            mockMessageService.sendMessage.mockRejectedValue(error);
            
            await messageController.sendMessage(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});