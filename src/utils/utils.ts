import { EndpointError } from "../classes/EndpointError.js";
import { ParamType } from "../enums.js";
import type { ChatParams, MemberParams, MessageParams, ProfileParams, UUID } from "../types/common.js";

const PARAM_RULES: Record<ParamType, string[]> = {
    [ParamType.PROFILE]: ["userId"],
    [ParamType.CHAT]: ["chatId"],
    [ParamType.MEMBER]: ["chatId", "memberId"],
    [ParamType.MESSAGE]: ["chatId", "memberId"]
};

export function handleParams(params: any, type: ParamType.PROFILE): Required<ProfileParams>;
export function handleParams(params: any, type: ParamType.CHAT): Required<ChatParams>;
export function handleParams(params: any, type: ParamType.MEMBER): Required<MemberParams>;
export function handleParams(params: any, type: ParamType.MESSAGE): Required<MessageParams>;

export function handleParams(params: any, type: ParamType): any {
    const requiredKeys = PARAM_RULES[type];

    for (const key of requiredKeys) {
        if (!params[key]) {
            const readableKey = key.replace("Id", " ID").charAt(0).toUpperCase();
            throw new EndpointError(400, `${readableKey} is required.`);
        }
    }
    return params;
};

function isUUID(id: UUID) {
    
}