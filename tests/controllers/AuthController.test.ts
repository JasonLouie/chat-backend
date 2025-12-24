import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../src/controllers/AuthController";
import { AuthService } from "../../src/services/AuthService";
import { EndpointError } from "../../src/classes/EndpointError";
import { ProfileService } from "../../src/services/ProfileService";
import { TokenService } from "../../src/services/TokenService";
import { UserStatus } from "../../src/enums";

describe("AuthController", () => {
    let authController: AuthController;
    let mockAuthService: jest.Mocked<AuthService>;
    let mockProfileService: jest.Mocked<ProfileService>;
    let mockTokenService: jest.Mocked<TokenService>;

    beforeEach(() => {
        // Create fake service with Jest Mocks
        // Cast it to 'unkown' to bypass private property checks
        mockAuthService = {
            findUserById: jest.fn(),
            getUserFullorThrow: jest.fn(),
            register: jest.fn(),
            validateUser: jest.fn(),
            updateUsername: jest.fn(),
            updatePassword: jest.fn(),
            updateEmail: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        mockProfileService = {
            getProfile: jest.fn()
        } as unknown as jest.Mocked<ProfileService>;

        mockTokenService = {
            generateTokens: jest.fn(),
            refresh: jest.fn(),
            removeToken: jest.fn()
        } as unknown as jest.Mocked<TokenService>;

        // Inject Fake Service into the Real Controller
        authController = new AuthController(mockAuthService, mockProfileService, mockTokenService);
    });

    describe("register", () => {
        it("should return 201, user's full profile, and the access and refresh tokens.", async () => {
            const req = createRequest({
                method: "POST",
                body: { username: "test_user", email: "test@gmail.com", password: "TestPass1234!" }
            });
            const res = createResponse();
            const next = jest.fn();

            const mockResult = { id: "user-123", username: "test_user", status: UserStatus.OFFLINE, bio: null, imageUrl: null };
            mockAuthService.register.mockResolvedValue(mockResult as any);

            await authController.register(req, res, next);

            expect(mockAuthService.register).toHaveBeenCalledWith(
                "test_user",
                "test@gmail.com",
                "TestPass1234!"
            );
            expect(res.statusCode).toBe(201);
            expect(res._getJSONData()).toEqual(mockResult);
        });

        it("should set accessToken and refreshToken cookies on successful registration", async () => {

        });
    });

    describe("login", () => {
        it("should return 200, user's full profile, and the access and refresh tokens.", async () => {
            const req = createRequest({
                method: "POST",
                body: { username: "test_user", password: "TestPass1234!" }
            });
            const res = createResponse();
            const next = jest.fn();

            // Mock the service return value
            const mockResult = { id: "user-123", username: "test_user", status: UserStatus.OFFLINE, bio: null, imageUrl: null };
            mockAuthService.validateUser.mockResolvedValue(mockResult as any);

            // Act
            await authController.login(req, res, next);

            // Assert
            expect(mockAuthService.validateUser).toHaveBeenCalledWith(
                "test_user",
                "TestPass1234!"
            );
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual(mockResult);
        });

        it("should call next(err) if service throws an error", async () => {
            const req = createRequest({
                body: { content: "Hi" }
            });
            const res = createResponse();
            const next = jest.fn();

            // Simulate Service Failure
            const error = new EndpointError(403, "Not allowed");
            mockAuthService.validateUser.mockRejectedValue(error);
            
            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("logout", () => {
        it ("should return 204", async () => {
            const req = createRequest({
                method: "POST",
                cookies: {
                    refreshToken: "refresh_token"
                }
            });
            const res = createResponse();
            const next = jest.fn();

            await authController.logout(req, res, next);

            expect(mockTokenService.removeToken).toHaveBeenCalledWith(
                "refresh_token"
            );

            expect(res.statusCode).toBe(204);
        });
    });

    describe("refreshTokens", () => {
        it ("should return 204", async () => {
            
        });
    });

    describe("updateUsername", () => {
        it ("should return 204", async () => {
            
        });
    });

    describe("updatePassword", () => {
        it ("should return 204", async () => {
            
        });
    });

    describe("updateEmail", () => {
        it ("should return 204", async () => {
            
        });
    });

    describe("deleteUser", () => {
        it ("should return 204", async () => {
            
        });
    });
});