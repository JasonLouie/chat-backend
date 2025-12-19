import { AppDataSource } from "../db/data-source.js";
import jwt, { type SignOptions } from "jsonwebtoken";
import { RefreshToken } from "../entities/RefreshToken.js";
import { EndpointError } from "../classes/EndpointError.js";
import { randomBytes } from "crypto";
import type { Tokens, UUID } from "../types/common.js";

export class TokenService {
    private tokenRepo = AppDataSource.getRepository(RefreshToken);

    /**
     * Generates access and refresh tokens
     */
    async generateTokens(userId: UUID): Promise<Tokens> {
        const expiresIn = process.env.TOKEN_EXPIRATION as SignOptions["expiresIn"] || "1h";
        const accessToken = jwt.sign({ sub: userId }, process.env.TOKEN_SECRET as string, { expiresIn: expiresIn });
        
        const refreshToken = randomBytes(60).toString("hex");
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.REFRESH_TOKEN_DAYS || "7"));
        
        const dbToken = this.tokenRepo.create({
            token: refreshToken,
            userId: userId,
            expiresAt: expiresAt
        });
        await this.tokenRepo.save(dbToken)
        return { accessToken, refreshToken };
    }

    /**
     * Refreshes access and refresh tokens if user provides a valid refresh token
     */
    async refresh(cookies: Record<string, string>): Promise<Tokens> {
        if (!cookies?.refreshToken) throw new EndpointError(400, "Refresh token is required.");
        const refreshToken = cookies.refreshToken;

        let dbToken;
        try {
            dbToken = await this.tokenRepo.findOne({
                where: { token: refreshToken },
                select: ["token", "userId", "expiresAt"]
            });
        } catch (error) {
            throw new EndpointError(500, "Server error during token refresh.");
        }

        // If dbToken DNE, 403 Forbidden because an attempt is made to generate a new access token with an invalid refresh token
        if (!dbToken) throw new EndpointError(403, "Failed to generate new tokens. Invalid refresh token.");
    
        // Check if refresh token expired
        if (dbToken.expiresAt < new Date()) throw new EndpointError(403, "Failed to generate new tokens. Refresh token is expired.");

        const userId = dbToken.userId;
        const [tokens] = await Promise.all([this.generateTokens(userId), this.tokenRepo.remove(dbToken)]);
        return tokens;
    }

    /**
     * Removes refresh token when user logs out
     */
    async removeToken(cookies: Record<string, string>) {
        if (!cookies?.refreshToken) return; // User is already logged out since there is no cookie or refresh token.
        const refreshToken = cookies.refreshToken;

        let dbToken;
        try {
            dbToken = await this.tokenRepo.findOne({
                where: { token: refreshToken },
                select: ["token", "userId", "expiresAt"]
            });
        } catch (error) {
            throw new EndpointError(500, "Server error during logout.");
        }

        // Refresh token is already invalid, so prompt user to logout.
        if (!dbToken) return;

        await this.tokenRepo.remove(dbToken);
    }
}