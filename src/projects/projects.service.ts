import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatedBy, CreateProjectDto } from './dto/project-dto';

@Injectable()
export class ProjectsService {
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
    console.log(whereCondition);

    const [projects, totalProjects] = await Promise.all([
      this.prisma.project.findMany({
        skip,
        take: limit,
        // eslint-disable-next-line
        where: whereCondition,
        include: {
          collaborators: {
            include: {
              user: {
                select: {
                  firstname: true,
                  lastname: true,
                },
              },
            },
          },
        },
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

  async addUserToProject(email: string, projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new BadRequestException('Project does not exist');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User does not exist');

    const isExistingMember = await this.prisma.collaborator.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
    });
    if (isExistingMember)
      throw new BadRequestException(
        'This user is already a member of this project',
      );

    const newMember = await this.prisma.collaborator.create({
      data: {
        userId: user.id,
        projectId: project.id,
      },
    });
    return newMember;
  }

  async createProject(payload: CreateProjectDto, userId: number) {
    const newProject = await this.prisma.project.create({
      data: {
        ...payload,
        owner: { connect: { id: userId } },
        collaborators: { create: { userId, role: 'ADMIN' } },
      },
    });

    return newProject;
  }
}
