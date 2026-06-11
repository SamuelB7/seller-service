import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class FulfillmentSettingsDto {
  @ApiProperty({ example: 'BR' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  originCountry: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  originState: string;

  @ApiProperty({ example: 'Sao Paulo' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  originCity: string;

  @ApiProperty({ example: '01310-100' })
  @IsString()
  @MinLength(3)
  @MaxLength(24)
  originPostalCode: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  @Max(30)
  handlingTimeDays: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  pickupEnabled: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  dropOffEnabled: boolean;
}

