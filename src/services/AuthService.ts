import { AppDataSource } from "../db/data-source.js";
import { User } from "../entities/User.js";
import { Profile } from "../entities/Profile.js";
import { EndpointError } from "../classes/EndpointError.js";
import type { ValidationErrors } from "../types/validate.js";
import type { UUID } from "../types/common.js";
import { Not, type DataSource, type EntityManager, type FindOptionsSelect, type FindOptionsWhere, type Repository } from "typeorm";
import type { AuthField } from "../types/auth.js";

export class AuthService {
    private dataSource: DataSource;
    private userRepo: Repository<User>;

    constructor() {
        this.dataSource = AppDataSource;
        this.userRepo = AppDataSource.getRepository(User);
    }

    // Used by passport strategy
    async findUserById(id: UUID, transactionManager?: EntityManager) {
        const manager = transactionManager || this.userRepo.manager;
        return await manager.findOne(User, {
            where: { id },
            select: { id: true, username: true, password: true }
        });
    }

    // Used when showing the user's private account info (email is usually hidden)
    async getUserFullorThrow(id: UUID) {
        const user = await this.userRepo.findOne({
            where: { id },
            select: { id: true, username: true, email: true }
        });

        // User does not exist
        if (!user) throw new EndpointError(404, "User does not exist.");
        return user;
    }

    async register(username: string, email: string, password: string): Promise<User> {
        return await this.dataSource.transaction(async (manager) => {
            // Check if users have the username or email
            await this.checkUsernameEmail(manager, username, email);
    
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
        });
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
        return await this.dataSource.transaction(async (manager) => {
            const [user] = await Promise.all([this.findUserOrThrow(id), this.checkUsernameEmail(manager, newUsername, undefined, id)]);
            user.username = newUsername;
            await manager.save(User, user);
        });
    }

    async updatePassword(id: UUID, oldPassword: string, newPassword: string) {
        const user = await this.findUserOrThrow(id);
        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) throw new EndpointError(400, { password: ["Incorrect password."] });
        if (oldPassword === newPassword) throw new EndpointError(400, { password: ["New password cannot be the same as old password."] });
        
        user.password = newPassword;
        this.userRepo.save(user);
    }

    async updateEmail(id: UUID, newEmail: string, password: string) {
        return await this.dataSource.transaction(async (manager) => {
            const [user] = await Promise.all([this.findUserOrThrow(id), this.checkUsernameEmail(manager, undefined, newEmail, id)]);
            const isMatch = await user.comparePassword(password);
    
            if (!isMatch) throw new EndpointError(400, {password: ["Incorrect password."]});
            
            user.email = newEmail;
            await manager.save(User, user);
        });
    }

    async deleteUser(id: UUID) {
        await this.userRepo.softDelete({ id });
    }

    /**
     * Finds a user by id. Returns 404 error if it does not exist.
     */
    private async findUserOrThrow(id: UUID, transactionManager?: EntityManager) {
        const manager = transactionManager || this.userRepo.manager;
        const user = await manager.findOne(User, {
            where: { id },
            select: { id: true, username: true, email: true, password: true }
        });
        if (!user) throw new EndpointError(404, "User does not exist.");
        return user;
    }

    private async checkUsernameEmail(manager: EntityManager, username?: string, email?: string, excludeUserId?: UUID) {
        const where: FindOptionsWhere<User>[] = [];
        
        const addCondition = (condition: AuthField) => {
            if (excludeUserId) {
                where.push({ ...condition, id: Not(excludeUserId) })
            } else {
                where.push(condition);
            }
        }

        if (username) addCondition({ username });
        if (email) addCondition({ email });

        // Return early if no checks are requested
        if (where.length === 0) return;

        const select: FindOptionsSelect<User> = {
            id: true,
            ...(username !== undefined && { username: true }),
            ...(email !== undefined && { email: true })
        };

        const existingUsers = await manager.find(User, { where, select });

        if (existingUsers.length > 0) {
            const errors: ValidationErrors = {};

            const emailTaken = existingUsers.some(u => u.email === email);
            if (emailTaken) errors.email = ["Email is already in use."];

            const usernameTaken = existingUsers.some(u => u.username === username);
            if (usernameTaken) errors.username = ["Username is already taken."];

            if (Object.keys(errors).length > 0) throw new EndpointError(409, errors);
        }
    } 
}