import { type Request } from "express";
import { EndpointError } from "../errors/EndpointError.js";

export const requireUser = (req: Request<any, any, any, any>) => {
    if (!req.user) {
        throw new EndpointError(401, "User not authenticated.");
    }
    return req.user;
};

export const requireFile = (req: Request<any, any, any, any>) => {
    if (!req.file) {
        throw new EndpointError(400, "No file uploaded.");
    }
    return req.file;
}