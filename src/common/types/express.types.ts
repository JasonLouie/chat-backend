import type { Request } from "express";
import { User } from "../../modules/users/user.entity.js";

export interface ProtectedRequest<
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user: User;
}