import {
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

@Injectable()
export class ProjectsService {
  private logger = new Logger(ProjectsService.name);
  constructor(private prisma: PrismaService) {}

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

    const newColumn = this.prisma.column.create({
      data: {
        ...payload,
        position:
          highestPosition._max.position !== null
            ? highestPosition._max.position + 1
            : 1,
        project: { connect: { id: project.id } },
      },
    });

    return newColumn;
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
