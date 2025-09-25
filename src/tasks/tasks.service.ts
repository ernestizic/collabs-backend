import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { getTaskQueryType, TaskType } from './types/task-types';
import { CreateTaskDto } from './dto/task-dto';

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async getAllProjectTasks(
    userId: number,
    projectId: number,
    page = 1,
    query: getTaskQueryType,
  ) {
    const member = await this.prismaService.collaborator.findUnique({
      where: {
        userId_projectId: {
          userId: userId,
          projectId,
        },
      },
    });

    if (!member)
      throw new ForbiddenException('You are not allowed to view this resource');

    const limit = 20;
    const skip = (page - 1) * limit;

    const filterParams: getTaskQueryType = {};

    if (query.columnId) filterParams.columnId = query.columnId;

    if (query.type) {
      if (!Object.values(TaskType).includes(query.type)) {
        throw new BadRequestException('Wrong task type');
      }

      filterParams.type = query.type;
    }

    const [tasks, taskCount] = await Promise.all([
      this.prismaService.task.findMany({
        where: { column: { projectId }, ...filterParams },
        skip,
        take: limit,
      }),
      this.prismaService.task.count({
        where: { column: { projectId }, ...filterParams },
      }),
    ]);

    return {
      tasks,
      pagination: {
        total: taskCount,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(taskCount / limit),
      },
    };
  }

  async createTask(userId: number, projectId: number, payload: CreateTaskDto) {
    const member = await this.prismaService.collaborator.findUnique({
      where: {
        userId_projectId: {
          userId: userId,
          projectId,
        },
      },
    });
    if (!member)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    const column = await this.prismaService.column.findFirst({
      where: { projectId, position: 1 },
    });
    if (!column)
      throw new BadRequestException(
        'Task cannot be created outside a column. Please add a column',
      );

    const collaborators = await this.prismaService.collaborator.findMany({
      where: {
        id: { in: payload.assignees },
        projectId,
      },
    });
    if (
      payload.assignees &&
      collaborators.length !== payload.assignees.length
    ) {
      throw new BadRequestException(
        'One or more collaborators cannot be found in this project',
      );
    }

    const newTask = await this.prismaService.task.create({
      data: {
        title: payload.title,
        assignees: {
          create: payload.assignees?.map((collaboratorid) => ({
            collaborator: { connect: { id: collaboratorid } },
          })),
        },
        column: { connect: { id: column.id } },
      },
    });

    return newTask;
  }

  async deleteTask(userId: number, projectId: number, taskId: string) {
    const member = await this.prismaService.collaborator.findUnique({
      where: {
        userId_projectId: {
          userId: userId,
          projectId,
        },
      },
    });
    if (!member)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    const task = await this.prismaService.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { project: true } } },
    });

    if (!task) throw new NotFoundException('Task not found');

    const res = await this.prismaService.task.delete({
      where: { id: taskId },
      include: { column: { include: { project: true } } },
    });
    return res;
  }
}
