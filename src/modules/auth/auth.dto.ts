import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsValidPassword } from "../../decorators/IsValidPassword.js";
import { IsValidEmail } from "../../decorators/IsValidEmail.js";
import { IsValidUsername } from "../../decorators/IsValidUsername.js";
import { IsValidDisplayName } from "../../decorators/IsValidDisplayName.js";

export class RegisterDto {
    @IsNotEmpty({ message: "Username is required" })
    @IsValidUsername()
    username!: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsValidEmail()
    email!: string;

    @IsValidPassword()
    password!: string;

    @IsOptional()
    @IsValidDisplayName()
    displayName?: string;
}

export class LoginDto {
    @IsString()
    username!: string;

    @IsString()
    password!: string;
}

export class ModifyUsernameDto {
    
}