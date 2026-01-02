import { User as UserEntity } from "../../modules/users/user.entity.js";

declare global {
    namespace Express {
        interface User extends UserEntity {}
    }
}