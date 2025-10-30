import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { type AuthRequest } from 'src/utils/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  DeleteTaskDto,
  GetTasksDto,
  UpdateTaskDto,
  UpdateTaskParamDto,
} from 'src/tasks/dto/task-dto';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // GET ALL TASKS INSIDE OF A PROJECT
  @Get()
  async fetchProjectTasks(
    @Param('projectId') projectId: string,
    @Query() query: GetTasksDto,
    @Request() req: AuthRequest,
  ) {
    const user_id = req.user.id;
    const { page, ...restOfQuery } = query;
    const tasks = await this.tasksService.getAllProjectTasks(
      user_id,
      Number(projectId),
      page,
      restOfQuery,
    );

    return {
      status: true,
      message: 'Request successful',
      data: tasks,
    };
  }

  // CREATE TASK INSIDE A PROJECT
  @Post()
  async createProjectTask(
    @Param('projectId') projectId: string,
    @Body() payload: CreateTaskDto,
    @Request() req: AuthRequest,
  ) {
    const user_id = req.user.id;
    const task = await this.tasksService.createTask(
      user_id,
      Number(projectId),
      payload,
    );

    return {
      status: true,
      message: 'Request successful',
      data: task,
    };
  }

  // DELETE TASK FROM A PROJECT
  @Delete(':taskId')
  async deleteProjectTask(
    @Param() param: DeleteTaskDto,
    @Request() req: AuthRequest,
  ) {
    const { projectId, taskId } = param;
    const user_id = req.user.id;
    await this.tasksService.deleteTask(user_id, projectId, taskId);

    return {
      status: true,
      message: 'Task deleted successfully',
    };
  }

  // UPDATE TASK IN A PROJECT
  @Patch(':taskId')
  async updateTaskById(
    @Param() param: UpdateTaskParamDto,
    @Body() payload: UpdateTaskDto,
    @Request() req: AuthRequest,
  ) {
    const { projectId, taskId } = param;
    const user_id = req.user.id;
    const updatedTask = await this.tasksService.updateTask(
      user_id,
      projectId,
      taskId,
      payload,
    );

    return {
      status: true,
      message: 'Task updated successfully',
      data: updatedTask,
    };
  }

  @Get(':taskId')
  async getTaskById(
    @Param() param: UpdateTaskParamDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const { taskId, projectId } = param;
    const task = await this.tasksService.getTaskById(taskId, userId, projectId);

    return {
      status: true,
      message: 'Request successful',
      data: task,
    };
  }
}
