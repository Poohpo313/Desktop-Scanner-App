import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class PinLoginDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  @Length(4, 12)
  @Matches(/^\d+$/)
  pin!: string;
}

export class ChangePinDto {
  @ApiProperty()
  @IsString()
  @Length(4, 12)
  @Matches(/^\d+$/)
  oldPin!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(4, 12)
  @Matches(/^\d+$/)
  newPin!: string;
}
