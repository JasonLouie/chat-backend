import { User as UserEntity } from "../../modules/users/user.entity.js";
import { type Request } from "express";
import { type ParamsDictionary } from "express-serve-static-core";

declare global {
    namespace Express {
        interface User extends UserEntity {}
    }
}

export type TypedRequest<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = any> = Request<
    P & ParamsDictionary,
    ResBody,
    ReqBody,
    ReqQuery
>;