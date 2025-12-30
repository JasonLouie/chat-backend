import { AppDataSource } from "../../db/data-source.js";
import { User } from "../users/user.entity.js";
import { Profile } from "../users/profiles/profile.entity.js";
import type { UUID } from "../../common/types/common.js";
import { type DataSource } from "typeorm";
import { UserService } from "../users/user.service.js";

export class AuthService {
    private dataSource: DataSource;
    private userService: UserService;

    constructor(userService: UserService) {
        this.dataSource = AppDataSource;
        this.userService = userService;
    }

    /**
     * Returns a user's id. Used by the jwt passport strategy when validating a user's access token
     */
    public findUserById = async (id: UUID): Promise<User | null> => {
        return await this.dataSource.manager.findOne(User, {
            where: { id },
            select: { id: true }
        } );
    }

    /**
     * Handles user registration. Ensures unique username and email. Creates a corresponding user profile.
     */
    public register = async (username: string, email: string, password: string, displayName?: string): Promise<User> => {
        return await this.dataSource.transaction(async (manager) => {
            // Check if users have the username or email
            await this.userService.checkUsernameEmail(manager, username, email);
    
            const newUser = manager.create(User, {
                username,
                email,
                password
            });
    
            const newProfile = manager.create(Profile, {
                displayName: displayName !== undefined ? displayName : username
            });

            newUser.profile = newProfile;
    
            // Save the user to db. Also saves the attached profile because of cascade: true in entities/User.ts
            await manager.save(newUser);
            return newUser;
        });
    }

    /**
     * Handles user login. Used in the local passport strategy to handle user authentication.
     */
    public validateUser = async (username: string, password: string): Promise<User | null> => {
        const manager = this.dataSource.manager;
        const user = await manager.findOne(User, {
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
}