import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SellerDocumentDto {
  @ApiProperty({ example: 'business_registration' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  documentType: string;

  @ApiProperty({ example: 's3://bucket/seller-documents/file.pdf' })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  fileReference: string;
}

