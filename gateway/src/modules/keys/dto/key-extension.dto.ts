import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class RequestKeyExtensionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  requestedDays!: number;

  @IsOptional()
  @IsString()
  userNote?: string;
}

export class ForwardKeyRequestDto {
  @IsOptional()
  @IsString()
  adminNote?: string;
}

export class RejectKeyRequestDto {
  @IsOptional()
  @IsString()
  note?: string;
}

export class ApproveKeyRequestDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  requestedDays!: number;

  @IsOptional()
  @IsString()
  superadminNote?: string;
}

export class ModifyKeyExpiryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  durationDays!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
