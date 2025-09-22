import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';
import {
  AddUserDto,
  CreateProjectDto,
  FetchProjectsDto,
  UpdateProjectDto,
} from './dto/project-dto';
import { type AuthRequest } from 'src/utils/types';

@Controller('projects')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async getProjects(@Query('page') page: number) {
    const projects = await this.projectsService.getAllProjects(page);

    return {
      status: true,
      message: 'Request successful',
      data: projects,
    };
  }

  @Get('user')
  async getAllUserProjects(
    @Query() query: FetchProjectsDto,
    @Request() req: AuthRequest,
  ) {
    const { page, createdBy } = query;
    const projects = await this.projectsService.getUserProjects(
      req.user.id,
      page,
      createdBy,
    );

    return {
      status: true,
      message: 'Request successful',
      data: projects,
    };
  }

  @Post()
  async createProject(
    @Body() payload: CreateProjectDto,
    @Request() req: AuthRequest,
  ) {
    const project = await this.projectsService.createProject(
      payload,
      req.user.id,
    );

    return {
      status: true,
      message: 'Project created successfully',
      data: project,
    };
  }

  @Post('add-user')
  async addUserToProject(
    @Body() payload: AddUserDto,
    @Request() req: AuthRequest,
  ) {
    const { email, project_id } = payload;

    // Allow only the user accepting the invite to perform the action
    if (req.user.email !== email)
      throw new ForbiddenException("You're not allowed to perform this action");

    const result = await this.projectsService.addUserToProject(
      email,
      project_id,
    );

    return {
      status: true,
      message: 'User added successfully',
      data: result,
    };
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Request() req: AuthRequest) {
    await this.projectsService.deleteProjectById(Number(id), req.user.id);

    return {
      status: true,
      message: 'Project deleted',
    };
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() payload: UpdateProjectDto,
    @Request() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const project = await this.projectsService.updateProjectById(
      userId,
      Number(id),
      payload,
    );

    return {
      status: true,
      message: 'Project updated',
      data: project,
    };
  }
}
