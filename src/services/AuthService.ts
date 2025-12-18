import { AppDataSource } from "../db/data-source.js";
import { User } from "../entities/User.js";
import { Profile } from "../entities/Profile.js";
import { EndpointError } from "../classes/EndpointError.js";
import bcrypt from "bcryptjs";
import type { ValidationErrors } from "../types/validate.js";

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    async getUserById(userId: string, allowThrow = true) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ["id", "username", "email", "password_hash"]
        });

        // User does not exist
        if (!user && allowThrow) throw new EndpointError(404, "User does not exist.");
        return user;
    }

    async register(username: string, email: string, password: string): Promise<User> {
        // Find users that have the username or email
        const existingUsers = await this.userRepository.find({
            where: [
                { email },
                { username }
            ]
        });

        // If users were found, check why and throw errors
        if (existingUsers.length > 0) {
            const errors: ValidationErrors = {};

            const emailTaken = existingUsers.some(u => u.email === email);
            if (emailTaken) errors.email = ["Email is already in use."];

            const usernameTaken = existingUsers.some(u => u.username === username);
            if (usernameTaken) errors.username = ["Username is already taken."];

            if (Object.keys(errors).length > 0) throw new EndpointError(409, errors);
        }

        const salt = await bcrypt.genSalt(13);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = this.userRepository.create({
            username,
            email,
            password_hash: hashedPassword
        });

        const newProfile = new Profile();
        newUser.profile = newProfile;

        // Save the user to db. Also saves the attached profile because of cascade: true in entities/User.ts
        await this.userRepository.save(newUser);
        return newUser;
    }

    async login(username: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { username },
            select: ["id", "username", "email", "password_hash"]
        });

        // User does not exist
        if (!user) throw new EndpointError(404, "User does not exist.");

        const isMatch = await bcrypt.compare(password, user.password_hash);

        // Incorrect password
        if (!isMatch) throw new EndpointError(401, "Invalid password.");
        return user;
    }
}