import { Status } from "../enums.js";
import type { ValidationErrors } from "../types/validate.js";

export class EndpointError {
    public readonly status;
    public readonly message;
    public readonly name;

    constructor(status: number, message: string | ValidationErrors, name?: string) {
        this.status = status;
        this.message = status === 500 ? "Internal Server Error" : message;
        this.name = name || Status[status] || Status[500]!;
    }

    toJSON() {
        return {name: this.name, status: this.status, message: this.message};
    }

    toString() {
        return `[${this.status} ${this.name}]: ${this.message}`;
    }
}