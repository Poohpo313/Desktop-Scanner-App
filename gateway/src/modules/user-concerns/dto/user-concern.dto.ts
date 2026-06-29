import { IsEmail, IsInt, IsOptional, IsString, Max, Min, MinLength } from "class-validator";

export class CreateUserConcernDto {
  @IsString()
  @MinLength(1)
  concernType!: string;

  @IsString()
  @MinLength(1)
  category!: string;

  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(1)
  message!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class UpdateUserConcernStatusDto {
  @IsString()
  @MinLength(1)
  status!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  adminReply?: string;
}
