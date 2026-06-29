import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class BulkGenerateDto {
  @ApiProperty({ minimum: 1, maximum: 500 })
  @IsInt()
  @Min(1)
  @Max(500)
  count!: number;
}

export class AssignToAdminDto {
  @ApiProperty()
  @IsUUID()
  adminId!: string;

  @ApiProperty()
  @IsUUID()
  keyId!: string;
}
