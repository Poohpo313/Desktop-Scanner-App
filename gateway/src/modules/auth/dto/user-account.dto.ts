import { IsString, MinLength } from "class-validator";

export class ActivateUserAccountDto {
  @IsString()
  @MinLength(1)
  serialKey!: string;

  @IsString()
  @MinLength(3)
  username!: string;
}

export class SyncUserAccountDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
