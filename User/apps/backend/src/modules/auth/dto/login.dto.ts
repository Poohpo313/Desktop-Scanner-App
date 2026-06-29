import { IsString, MinLength } from "class-validator";

export class AdminLoginDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(10)
  password!: string;
}

export class UserLoginDto extends AdminLoginDto {}

export class SuperAdminLoginDto {
  @IsString()
  @MinLength(4)
  pin!: string;
}
