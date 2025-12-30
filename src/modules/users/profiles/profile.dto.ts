import { IsOptional, IsString, MaxLength } from "class-validator";
import { IsValidDisplayName } from "../../../decorators/IsValidDisplayName.js";
import { ProfileRules } from "./profile.rules.js";

export class ModifyProfileDto {
    @IsOptional()
    @IsString()
    @MaxLength(ProfileRules.BIO.MAX_LENGTH, { message: ProfileRules.BIO.MESSAGE })
    newBio?: string;

    @IsOptional()
    @IsValidDisplayName()
    newDisplayName?: string;
}