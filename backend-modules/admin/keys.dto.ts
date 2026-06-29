import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GenerateKeyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose!: string;
}

export class AssignKeyDto {
  @ApiProperty()
  @IsUUID()
  keyId!: string;

  @ApiProperty()
  @IsUUID()
  userId!: string;
}
