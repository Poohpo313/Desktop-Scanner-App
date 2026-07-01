import { ValidateIf, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @ValidateIf((_, value) => value !== undefined && value !== null && String(value).trim() !== "")
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== undefined && value !== null && String(value).trim() !== "")
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((_, value) => value !== "")
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
