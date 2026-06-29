import { IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @MinLength(10)
  currentPassword!: string;

  @IsString()
  @MinLength(10)
  newPassword!: string;
}

export class ChangePinDto {
  @IsString()
  @MinLength(6)
  currentPin!: string;

  @IsString()
  @MinLength(6)
  newPin!: string;
}
