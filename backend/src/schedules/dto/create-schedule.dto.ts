import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  shiftStart: string;

  @IsString()
  @IsNotEmpty()
  shiftEnd: string;

  @IsString()
  @IsNotEmpty()
  shiftName: string;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  shiftStart?: string;

  @IsOptional()
  @IsString()
  shiftEnd?: string;

  @IsOptional()
  @IsString()
  shiftName?: string;
}
