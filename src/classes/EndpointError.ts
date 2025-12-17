import { Status } from "../enums.js";
import type { ValidationErrors } from "../middleware/validators.js";

export class EndpointError {
    #status;
    #message;
    #name;

    constructor(status: number, message: string | ValidationErrors, name?: string) {
        this.#status = status;
        this.#message = status === 404 ? `${message} not found.` : status === 500 ? "Internal Server Error" : message;
        this.#name = name || Status[status] || Status[500]!;
    }

    get status() {
        return this.#status;
    }

    get message() {
        return this.#message;
    }

    get name() {
        return this.#name;
    }

    toJSON() {
        return {name: this.#name, status: this.#status, message: this.#message};
    }

    toString() {
        return `[${this.#status} ${this.#name}]: ${this.#message}`;
    }
}