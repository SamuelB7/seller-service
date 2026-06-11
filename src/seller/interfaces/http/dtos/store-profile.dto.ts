import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class StoreProfileDto {
  @ApiProperty({ example: 'Jane Store' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  storeName: string;

  @ApiPropertyOptional({ example: 'Curated marketplace store.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  bannerUrl?: string;

  @ApiPropertyOptional({ example: 'support@example.com' })
  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @ApiPropertyOptional({ example: 'Returns accepted within 7 days.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  returnPolicy?: string;

  @ApiPropertyOptional({ example: 'Ships in 2 business days.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  shippingPolicy?: string;
}

