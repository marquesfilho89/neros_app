import { IsString, IsOptional, IsInt, Min, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

class ShiftConfigItem {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  start: string;

  @IsString()
  end: string;
}

class PeakHourItem {
  @IsString()
  start: string;

  @IsString()
  end: string;

  @IsInt()
  @Min(0)
  minCoverage: number;
}

export class CreateStoreDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsInt()
  @Min(1)
  numberOfCheckouts: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftConfigItem)
  shiftConfig?: ShiftConfigItem[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeakHourItem)
  peakHours?: PeakHourItem[];
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfCheckouts?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShiftConfigItem)
  shiftConfig?: ShiftConfigItem[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeakHourItem)
  peakHours?: PeakHourItem[];
}
