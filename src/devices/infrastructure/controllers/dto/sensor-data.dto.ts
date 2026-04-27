import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SensorDataDto {
  @IsNumber()
  temperature: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;

  @IsString()
  @IsOptional()
  timestamp?: string;
}
