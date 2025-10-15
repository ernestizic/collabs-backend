import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateColumnDto,
  CreatedBy,
  CreateProjectDto,
} from './dto/project-dto';
import { Prisma } from '@prisma/client';
import { defaultColumns } from 'src/utils/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ColumnType } from './dto/types';

@Injectable()
export class ProjectsService {
  private logger = new Logger(ProjectsService.name);
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getAllProjects(page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [projects, totalProjects] = await Promise.all([
      this.prisma.project.findMany({ skip, take: limit }),
      this.prisma.project.count(),
    ]);

    return {
      projects,
      pagination: {
        total: totalProjects,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalProjects / limit),
      },
    };
  }

  async getUserProjects(userId: number, page = 1, createdBy?: CreatedBy) {
    const limit = 20;
    const skip = (page - 1) * limit;

    let whereCondition: any = {};

    if (createdBy && createdBy === 'me') {
      // Only projects owned by the user
      whereCondition = { ownerId: userId };
    } else {
      whereCondition = {
        OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
      };
    }

    const [projects, totalProjects] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take: limit,
        // eslint-disable-next-line
        where: whereCondition,
        // include: {
        //   collaborators: {
        //     include: {
        //       user: {
        //         select: {
        //           firstname: true,
        //           lastname: true,
        //         },
        //       },
        //     },
        //   },
        // },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({
        // eslint-disable-next-line
        where: whereCondition,
      }),
    ]);

    return {
      projects,
      pagination: {
        total: totalProjects,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalProjects / limit),
      },
    };
  }

  async getSingleProject(id: number, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: id },
      include: {
        collaborators: {
          include: { user: { select: { firstname: true, lastname: true } } },
        },
      },
    });

    if (!project)
      throw new NotFoundException('Project with this ID does not exist');

    const exists = project.collaborators.find(
      (member) => member.userId === userId,
    );
    if (!exists)
      throw new ForbiddenException('You are not allowed to view this resource');

    return project;
  }

  async createProject(payload: CreateProjectDto, userId: number) {
    const newProject = await this.prisma.project.create({
      data: {
        ...payload,
        owner: { connect: { id: userId } },
        collaborators: { create: { userId, role: 'ADMIN' } },
        columns: {
          create: defaultColumns,
        },
      },
    });

    return newProject;
  }

  async deleteProjectById(projectId: number, signedUserId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project)
      throw new NotFoundException('Project with this ID does not exist');

    if (signedUserId !== project.ownerId)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    return this.prisma.project.delete({
      where: { id: project.id },
    });
  }

  async updateProjectById(
    signedUserId: number,
    projectId: number,
    data: Prisma.ProjectUpdateInput,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project)
      throw new NotFoundException('Project with this ID does not exist');

    const member = await this.prisma.collaborator.findFirst({
      where: { userId: signedUserId },
    });

    if (!member)
      throw new NotFoundException('You are not a member of the project');

    if (member.role !== 'ADMIN')
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    const updatedProject = this.prisma.project.update({
      where: { id: project.id },
      data,
    });

    return updatedProject;
  }

  async createProjectColumn(
    projectId: number,
    userId: number,
    payload: CreateColumnDto,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: true },
    });
    if (!project)
      throw new NotFoundException('Project with this ID does not exist');
    const exists = project.collaborators.find(
      (member) => member.userId === userId,
    );
    if (!exists)
      throw new ForbiddenException('You are not allowed to view this resource');

    const highestPosition = await this.prisma.column.aggregate({
      _max: { position: true },
      where: { projectId: project.id },
    });

    const newColumn = await this.prisma.column.create({
      data: {
        ...payload,
        position:
          highestPosition._max.position !== null
            ? highestPosition._max.position + 1
            : 1,
        project: { connect: { id: project.id } },
      },
    });

    this.eventEmitter.emit('column.created', {
      projectId: project.id,
      column: newColumn,
    });

    return newColumn;
  }

  async updateColumn(
    payload: Prisma.ColumnUpdateInput,
    columnId: string,
    userId: number,
  ) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { project: { include: { collaborators: true } } },
    });
    const isMember = column?.project.collaborators.find(
      (item) => item.userId === userId,
    );
    if (!column)
      throw new ForbiddenException('Column with this ID does not exist');
    if (!isMember)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    const updatedColumn = await this.prisma.column.update({
      where: { id: column.id },
      data: {
        name: payload.name,
        description: payload.description,
        column_limit: payload.column_limit,
        identifier: payload.identifier,
      },
    });

    this.eventEmitter.emit('column.updated', {
      projectId: column.project.id,
      column: updatedColumn,
    });

    return updatedColumn;
  }

  async updateColumnsPosition(
    userId: number,
    projectId: number,
    changedColumns: ColumnType[],
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: true },
    });
    const isMember = project?.collaborators.find(
      (member) => member.userId === userId,
    );

    if (!project)
      throw new NotFoundException('Project with this ID does not exist');
    if (!isMember)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    try {
      const res = await this.prisma.$transaction(
        changedColumns.map((col) => {
          return this.prisma.column.update({
            where: { id_updatedAt: { id: col.id, updatedAt: col.updatedAt } },
            data: { position: col.position },
          });
        }),
      );

      this.eventEmitter.emit('column.updated', {
        projectId: project.id,
        column: res[0],
      });

      return res;
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException(
        error,
        'Failed to update column positions. A column is being updated by another user. Please refresh and try again',
      );
    }
  }

  async deleteColumn(columnId: string, userId: number) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { project: { include: { collaborators: true } } },
    });
    const isMember = column?.project.collaborators.find(
      (item) => item.userId === userId,
    );
    if (!column)
      throw new ForbiddenException('Column with this ID does not exist');
    if (!isMember)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    const deletedColumn = await this.prisma.column.delete({
      where: { id: column.id },
    });

    this.eventEmitter.emit('column.deleted', {
      projectId: column.project.id,
      column: deletedColumn,
    });

    return deletedColumn;
  }

  async getAllProjectColumns(id: number, userId: number) {
    const member = await this.prisma.collaborator.findUnique({
      where: {
        userId_projectId: {
          userId: userId,
          projectId: id,
        },
      },
    });

    if (!member)
      throw new ForbiddenException('You are not allowed to view this resource');

    const columns = await this.prisma.column.findMany({
      where: { projectId: id },
      orderBy: { position: 'asc' },
    });
    return columns;
  }
}
