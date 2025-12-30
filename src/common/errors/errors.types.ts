export enum Status {
    Bad_Request = 400,
    Unauthorized = 401,
    Forbidden = 403,
    Not_Found = 404,
    Conflict = 409,
    Server_Error = 500
}

export interface FormattedErrors {
    [field: string]: string[];
}