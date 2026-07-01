import { IsString, Length, Matches, MinLength } from "class-validator";

export class AdminLoginDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(7)
  password!: string;
}

export class UserLoginDto extends AdminLoginDto {}

export class SuperAdminLoginDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  pin!: string;
}
