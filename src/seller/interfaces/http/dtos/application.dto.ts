import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SellerApplicationDto {
  @ApiProperty({ example: 'Jane Doe LLC' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  legalName: string;

  @ApiProperty({ example: 'Jane Store' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  businessName: string;

  @ApiProperty({ example: '12.345.678/0001-99' })
  @IsString()
  @MinLength(4)
  @MaxLength(64)
  taxId: string;

  @ApiProperty({ example: 'company' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  businessType: string;
}

