import { AppDataSource } from "../db/data-source.js";
import { User } from "../entities/User.js";
import { Profile } from "../entities/Profile.js";
import { EndpointError } from "../classes/EndpointError.js";
import type { ValidationErrors } from "../types/validate.js";
import type { UUID } from "../types/common.js";

export class AuthService {
    private userRepo = AppDataSource.getRepository(User);

    async findUserById(id: UUID) {
        return await this.userRepo.findOne({
            where: { id },
            select: { id: true, username: true, password: true }
        });
    }

    private async findUser(id: UUID) {
        const user = await this.userRepo.findOne({
            where: { id },
            select: { id: true, username: true, email: true, password: true }
        });
        if (!user) throw new EndpointError(404, "User does not exist.");
        return user;
    }

    // Used when showing the user's private account info
    async getUserFull(id: UUID) {
        const user = await this.userRepo.findOne({
            where: { id },
            select: { id: true, username: true, email: true }
        });

        // User does not exist
        if (!user) throw new EndpointError(404, "User does not exist.");
        return user;
    }

    async register(username: string, email: string, password: string): Promise<User> {
        // Find users that have the username or email
        const existingUsers = await this.userRepo.find({
            where: [ { email }, { username } ]
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

        const newUser = this.userRepo.create({
            username,
            email,
            password
        });

        const newProfile = new Profile();
        newUser.profile = newProfile;

        // Save the user to db. Also saves the attached profile because of cascade: true in entities/User.ts
        await this.userRepo.save(newUser);
        return newUser;
    }

    // Used for local passport strategy
    async login(username: string, password: string): Promise<User | null> {
        const user = await this.userRepo.findOne({
            where: { username },
            select: { id: true, username: true, password: true }
        });

        // User does not exist
        if (!user) return null;

        const isMatch = await user.comparePassword(password);

        // Incorrect password
        if (!isMatch) return null;
        return user;
    }

    async updateUsername(id: UUID, newUsername: string) {
        const [user, existingUser] = await Promise.all([this.findUser(id), this.userRepo.findOne({ where: { username: newUsername  }, select: { username: true } })]);
        if (existingUser) throw new EndpointError(400, {username: ["Username is taken."]});
        user.username = newUsername;
        this.userRepo.save(user);
    }

    async updatePassword(id: UUID, oldPassword: string, newPassword: string) {
        const user = await this.findUser(id);
        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) throw new EndpointError(400, {password: ["Incorrect password."]});
        if (oldPassword === newPassword) throw new EndpointError(400, "New password cannot be the same as old password.");
        
        user.password = newPassword;
        this.userRepo.save(user);
    }

    async updateEmail(id: UUID, newEmail: string, password: string) {
        const [user, existingUser] = await Promise.all([this.findUser(id), this.userRepo.findOne({ where: { email: newEmail }, select: { email: true } })]);
        const isMatch = await user.comparePassword(password);

        if (!isMatch) throw new EndpointError(400, {password: ["Incorrect password."]});
        if (existingUser) throw new EndpointError(400, {email: ["Email is already in use."]});
        
        user.email = newEmail;
        this.userRepo.save(user);
    }

    async deleteUser(id: UUID) {
        await this.userRepo.softDelete({ id });
    }
}