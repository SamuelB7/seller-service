import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { SELLER_STATUSES, SellerStatus } from '../../../domain/seller-types';

export class ChangeSellerStatusDto {
  @ApiProperty({ example: 'ACTIVE', enum: SELLER_STATUSES })
  @IsIn(SELLER_STATUSES)
  toStatus: SellerStatus;

  @ApiPropertyOptional({ example: 'KYC approved.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

