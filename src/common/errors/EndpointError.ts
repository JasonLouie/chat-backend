import { ErrorNames, type FormattedErrors } from "./errors.types.js";

export class EndpointError {
    public readonly status;
    public readonly message;
    public readonly name;

    constructor(status: number, message?: string | FormattedErrors, name?: string) {
        this.status = status;
        this.message = message;
        this.name = name || ErrorNames[status] || ErrorNames[500];
    }

    toJSON() {
        return {name: this.name, status: this.status, message: this.message};
    }

    toString() {
        return `[${this.status} ${this.name}]: ${this.message}`;
    }
}