export type AuthInfo = Error | { message: string } | undefined;

export interface AuthField {
    username?: string;
    email?: string;
}