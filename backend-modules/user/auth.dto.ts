import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;
}

export class ActivateAccountDto {
  @ApiProperty({ example: 'ABCD-EFGH-IJKL-MNOP' })
  @IsString()
  @IsNotEmpty()
  serialKey!: string;
}
