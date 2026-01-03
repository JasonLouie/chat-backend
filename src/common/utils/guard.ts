import type { TypedRequest } from "../types/express.types.js";
import { EndpointError } from "../errors/EndpointError.js";

export const requireUser = (req: TypedRequest) => {
    if (!req.user) {
        throw new EndpointError(401, "User not authenticated.");
    }
    return req.user;
};

export const requireFile = (req: TypedRequest) => {
    if (!req.file) {
        throw new EndpointError(400, "No file uploaded.");
    }
    return req.file;
}