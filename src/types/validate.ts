export interface RegexValidator {
    regex: RegExp;
    message: string;
}

export interface Rules {
    [key: string]: string | boolean | number | RegExp | RegexValidator[];
    regexes?: RegexValidator[];
    regex?: RegExp;
    message?: string;
    minLength?: number;
}

export interface Validations {
    [key: string]: Rules;
}

export interface ValidationErrors {
    [key: string]: string[];
}