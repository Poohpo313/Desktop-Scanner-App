import { IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}

export class ChangePinDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  currentPin!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  newPin!: string;
}
