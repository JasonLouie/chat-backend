import { AppDataSource } from "../db/data-source.js";
import jwt, { type SignOptions } from "jsonwebtoken";
import { RefreshToken } from "../entities/RefreshToken.js";
import { EndpointError } from "../classes/EndpointError.js";
import { randomBytes } from "crypto";

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export class TokenService {
    private tokenRepository = AppDataSource.getRepository(RefreshToken);

    /**
     * Generates access and refresh tokens
     */
    async generateTokens(userId: string): Promise<Tokens> {
        const expiresIn = process.env.TOKEN_EXPIRATION as SignOptions["expiresIn"] || "1h";
        const accessToken = jwt.sign({ sub: userId }, process.env.TOKEN_SECRET as string, { expiresIn: expiresIn });
        
        const refreshToken = randomBytes(60).toString("hex");
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.REFRESH_TOKEN_DAYS || "7"));
        
        const dbToken = this.tokenRepository.create({
            token: refreshToken,
            user_id: userId,
            expires_at: expiresAt
        });
        await this.tokenRepository.save(dbToken)
        return { accessToken, refreshToken };
    }

    /**
     * Refreshes access and refresh tokens if user provides a valid refresh token
     */
    async refresh(cookie: Record<string, string>): Promise<Tokens> {
        if (!cookie?.refreshToken) throw new EndpointError(400, "Refresh token is required.");
        const refreshToken = cookie.refreshToken;

        let dbToken;
        try {
            dbToken = await this.tokenRepository.findOne({
                where: { token: refreshToken },
                select: ["token", "user_id", "expires_at"]
            });
        } catch (error) {
            throw new EndpointError(500, "Server error during token refresh.");
        }

        // If dbToken DNE, 403 Forbidden because an attempt is made to generate a new access token with an invalid refresh token
        if (!dbToken) throw new EndpointError(403, "Failed to generate new tokens. Invalid refresh token.");
    
        // Check if refresh token expired
        if (dbToken.expires_at < new Date()) throw new EndpointError(403, "Failed to generate new tokens. Refresh token is expired.");

        const user_id = dbToken.user_id;
        const results = await Promise.all([this.generateTokens(user_id), this.tokenRepository.remove(dbToken)])
        return results[0];
    }

    /**
     * Removes refresh token when user logs out
     */
    async removeToken(cookie: Record<string, string>) {
        if (!cookie?.refreshToken) return; // User is already logged out since there is no cookie or refresh token.
        const refreshToken = cookie.refreshToken;

        let dbToken;
        try {
            dbToken = await this.tokenRepository.findOne({
                where: { token: refreshToken },
                select: ["token", "user_id", "expires_at"]
            });
        } catch (error) {
            throw new EndpointError(500, "Server error during logout.");
        }

        // Refresh token is already invalid, so prompt user to logout.
        if (!dbToken) return;

        await this.tokenRepository.remove(dbToken);
    }
}