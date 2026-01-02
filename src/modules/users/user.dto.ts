import { IsNotEmpty, IsString } from "class-validator";
import { IsValidPassword } from "../../decorators/IsValidPassword.js";
import { IsValidUsername } from "../../decorators/IsValidUsername.js";
import { IsValidEmail } from "../../decorators/IsValidEmail.js";

export class UpdateUsernameDto {
    @IsValidUsername()
    newUsername!: string;
}

export class UpdatePasswordDto {
    @IsString()
    @IsNotEmpty({ message: "Old Password is required." })
    oldPassword!: string;
    

    @IsValidPassword()
    newPassword!: string;
}

export class UpdateEmailDto {
    @IsValidEmail()
    newEmail!: string;

    @IsString()
    @IsNotEmpty({ message: "Password is required." })
    password!: string;
}