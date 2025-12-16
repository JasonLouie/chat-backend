import { AppDataSource } from "../db/data-source.js";
import { User } from "../entities/User.js";
import { Profile } from "../entities/Profile.js";

export class AuthService {
    private userRepo = AppDataSource.getRepository(User);

    async registerUser(username: string, email: string, password: string) {

    }

    
}