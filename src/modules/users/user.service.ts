import { In, Not, type DataSource, type EntityManager, type FindOptionsSelect, type FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../db/data-source.js";
import type { UUID } from "../../types/common.js";
import { EndpointError } from "../../classes/EndpointError.js";
import { User } from "./user.entity.js";
import type { ValidationErrors } from "../../types/validate.js";

export class UserService {
    private dataSource: DataSource;

    constructor() {
        this.dataSource = AppDataSource;
    }

    /**
     * Returns the user's id, username, and email
     */
    public getUserFull = async (id: UUID, transactionManager?: EntityManager): Promise<User> => {
        const manager = transactionManager || this.dataSource.manager;
        const user = await manager.findOne(User, {
            where: { id },
            select: { id: true, username: true, email: true }
        });

        // User does not exist
        if (!user) throw new EndpointError(404, "User does not exist.");
        return user;
    }

    /**
     * Handles updating a user's username
     */
    public updateUsername = async (
        id: UUID,
        newUsername: string
    ): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            const [user] = await Promise.all([
                this.findUserOrThrow(id),
                this.checkUsernameEmail(manager, newUsername, undefined, id),
            ]);
            user.username = newUsername;
            await manager.save(User, user);
        });
    };

    /**
     * Handles updating a user's password
     */
    public updatePassword = async (
        id: UUID,
        oldPassword: string,
        newPassword: string
    ): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            const user = await this.findUserOrThrow(id);
            const isMatch = await user.comparePassword(oldPassword);

            if (!isMatch)
                throw new EndpointError(400, {
                    password: ["Incorrect password."],
                });
            if (oldPassword === newPassword)
                throw new EndpointError(400, {
                    password: [
                        "New password cannot be the same as old password.",
                    ],
                });

            user.password = newPassword;
            await manager.save(user);
        });
    };

    /**
     * Handles updating a user's email
     */
    public updateEmail = async (
        id: UUID,
        newEmail: string,
        password: string
    ): Promise<void> => {
        return await this.dataSource.transaction(async (manager) => {
            const [user] = await Promise.all([
                this.findUserOrThrow(id),
                this.checkUsernameEmail(manager, undefined, newEmail, id),
            ]);
            const isMatch = await user.comparePassword(password);

            if (!isMatch)
                throw new EndpointError(400, {
                    password: ["Incorrect password."],
                });

            user.email = newEmail;
            await manager.save(User, user);
        });
    };

    /**
     * Handles deleting a user
     */
    public deleteUser = async (
        id: UUID,
        transactionManager?: EntityManager
    ): Promise<void> => {
        const manager = transactionManager || this.dataSource.manager;
        await manager.getRepository(User).softDelete({ id });
    };

    /**
     * Finds users with that username and/or email
     */
    public checkUsernameEmail = async (
        manager: EntityManager,
        username?: string,
        email?: string,
        excludeUserId?: UUID
    ): Promise<void> => {
        const where: FindOptionsWhere<User>[] = [];

        // Handles adding email or username related options for where
        const addCondition = (condition: FindOptionsWhere<User>) => {
            if (excludeUserId) {
                // Updating email/username
                where.push({ ...condition, id: Not(excludeUserId) });
            } else {
                // Handles registration
                where.push(condition);
            }
        };

        if (username) addCondition({ username });
        if (email) addCondition({ email });

        // Return early if no checks are requested
        if (where.length === 0) return;

        const select: FindOptionsSelect<User> = {
            id: true,
            ...(username !== undefined && { username: true }),
            ...(email !== undefined && { email: true }),
        };

        const existingUsers = await manager.find(User, { where, select });

        if (existingUsers.length > 0) {
            const errors: ValidationErrors = {};

            const emailTaken = existingUsers.some((u) => u.email === email);
            if (emailTaken) errors.email = ["Email is already in use."];

            const usernameTaken = existingUsers.some(
                (u) => u.username === username
            );
            if (usernameTaken) errors.username = ["Username is already taken."];

            if (Object.keys(errors).length > 0)
                throw new EndpointError(409, errors);
        }
    };

    /**
     * Counts how many valid users are in the array of user ids
     */
    public countUsers = async (userIds: UUID[], transactionManager?: EntityManager): Promise<number> => {
        const manager = transactionManager || this.dataSource.manager;
        return await manager.count(User, {
            where: { id: In(userIds) }
        });
    }

    /**
     * Finds a user by id. Returns 404 error if it does not exist.
     */
    private findUserOrThrow = async (
        id: UUID,
        transactionManager?: EntityManager
    ): Promise<User> => {
        const manager = transactionManager || this.dataSource.manager;
        const user = await manager.findOne(User, {
            where: { id },
            select: { id: true, username: true, email: true, password: true },
        });
        if (!user) throw new EndpointError(404, "User does not exist.");
        return user;
    };
}
