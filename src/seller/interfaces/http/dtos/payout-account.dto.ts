import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PayoutAccountDto {
  @ApiProperty({ example: 'Jane Doe LLC' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  accountHolderName: string;

  @ApiProperty({ example: 'Example Bank' })
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  bankName: string;

  @ApiPropertyOptional({ example: '001' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  bankCode?: string;

  @ApiPropertyOptional({ example: '1234' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  branchNumber?: string;

  @ApiProperty({ example: '6789' })
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  accountNumberLast4: string;

  @ApiProperty({ example: 'checking' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  accountType: string;

  @ApiPropertyOptional({ example: 'provider_account_123' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalAccountRef?: string;
}

