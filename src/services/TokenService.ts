import { AppDataSource } from "../db/data-source.js";
import jwt from "jsonwebtoken";
import { RefreshToken } from "../entities/RefreshToken.js";

export class TokenService {
    private tokenRepository = AppDataSource.getRepository(RefreshToken);

    async refreshToken() {

    }

    
}