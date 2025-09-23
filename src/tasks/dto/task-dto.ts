import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskType } from '../types/task-types';

export class GetTasksDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  page?: number;

  @IsString()
  @IsOptional()
  columnId?: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayNotEmpty()
  assignees?: number[];
}
