import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBase64, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  folderId?: string;

  @ApiProperty({ description: 'Base64 encoded file bytes' })
  @IsBase64()
  base64Content!: string;
}

export class SearchDocumentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  query!: string;
}
