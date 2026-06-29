import { Type } from "class-transformer";
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class AssignKeyDto {
  @IsInt()
  serialId!: number;

  @IsInt()
  userId!: number;
}

export class BulkGenerateDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  count!: number;

  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  department!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  expirationDays?: number;
}

export class CreateRevocationRequestDto {
  @IsIn(["key", "device"])
  requestType!: "key" | "device";

  @IsInt()
  targetId!: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
