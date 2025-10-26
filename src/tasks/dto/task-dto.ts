import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskType } from '../types/task-types';
import { TaskPriority } from '@prisma/client';

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

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskType)
  @IsOptional()
  type?: TaskType;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @ArrayNotEmpty()
  assignees?: number[];

  @IsString()
  @IsOptional()
  columnId?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}

export class DeleteTaskDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @IsNotEmpty()
  @IsString()
  taskId: string;
}

export class UpdateTaskParamDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @IsNotEmpty()
  @IsString()
  taskId: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @IsString()
  @IsOptional()
  columnId?: string;
}
