import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class AdminRecoveryDto {
  @IsString()
  @MinLength(3)
  identifier!: string;

  @IsIn(["email", "sms", "physical"])
  channel!: "email" | "sms" | "physical";

  @IsOptional()
  @IsString()
  username?: string;
}

export class SuperAdminRecoveryDto {
  @IsString()
  @MinLength(3)
  identifier!: string;

  @IsIn(["email", "phone", "alternative"])
  channel!: "email" | "phone" | "alternative";
}

export class UserRecoveryDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsIn(["email", "sms"])
  channel!: "email" | "sms";

  @IsOptional()
  @IsString()
  context?: string;
}
