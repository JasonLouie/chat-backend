export const ErrorNames: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden Action",
    404: "Resource Not Found",
    409: "Resource Conflict",
    500: "Internal Server Error"
}

export interface FormattedErrors {
    [field: string]: string[];
}