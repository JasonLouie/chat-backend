import { IsNotEmpty, IsString } from "class-validator";
import { IsValidPassword } from "../../decorators/IsValidPassword.js";
import { IsValidUsername } from "../../decorators/IsValidUsername.js";
import { IsValidEmail } from "../../decorators/IsValidEmail.js";

export class ModifyUsernameDto {
    @IsValidUsername()
    newUsername!: string;
}

export class ModifyPasswordDto {
    @IsString()
    @IsNotEmpty({ message: "Old Password is required." })
    oldPassword!: string;
    

    @IsValidPassword()
    newPassword!: string;
}

export class ModifyEmailDto {
    @IsValidEmail()
    newEmail!: string;

    @IsString()
    @IsNotEmpty({ message: "Password is required." })
    password!: string;
}