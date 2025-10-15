import { Type } from 'class-transformer';
import {
  ArrayContains,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import type { ColumnType } from './types';

export type CreatedBy = 'me';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class FetchProjectsDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsString()
  createdBy?: CreatedBy;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}

export class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  identifier: string;
}

export class UpdateColumnDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  identifier?: string;

  @IsNumber()
  @IsInt()
  @IsOptional()
  column_limit?: number;
}

export class UpdateColumnPositionsDto {
  @IsArray()
  @ArrayNotEmpty()
  changed_columns: ColumnType[];
}
