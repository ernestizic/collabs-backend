import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';
import {
  CreateProjectDto,
  FetchProjectsDto,
  UpdateProjectDto,
} from './dto/project-dto';
import { type AuthRequest } from 'src/utils/types';
import { MembersService } from 'src/members/members.service';
import { InviteMemberDto } from 'src/members/dto/members-dto';

@Controller('projects')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
  ) {}

  @Get()
  async getProjects(@Query('page') page: number) {
    const projects = await this.projectsService.getAllProjects(page);

    return {
      status: true,
      message: 'Request successful',
      data: projects,
    };
  }

  // GET ALL USER PROJECTS
  @Get('user')
  @UsePipes(ValidationPipe)
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

  // CREATE A PROJECT
  @Post()
  @UsePipes(ValidationPipe)
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

  @Post('invite-user')
  @HttpCode(HttpStatus.OK)
  async inviteUserToProject(
    @Request() req: AuthRequest,
    @Body() payload: InviteMemberDto,
  ) {
    const userId = req.user.id;
    const res = await this.membersService.sendInviteToUser(userId, payload);

    return {
      status: true,
      message: res,
    };
  }

  @Post('accept-invite')
  @HttpCode(HttpStatus.OK)
  async acceptProjectInvite(
    @Query('code') code: string,
    @Request() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const res = await this.membersService.acceptInvite(code, userId);

    return {
      status: true,
      message: 'Invite accepted',
      data: res,
    };
  }

  // DELETE A PROJECT
  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Request() req: AuthRequest) {
    await this.projectsService.deleteProjectById(Number(id), req.user.id);

    return {
      status: true,
      message: 'Project deleted',
    };
  }

  // UPDATE A PROJECT
  @Patch(':id')
  @UsePipes(ValidationPipe)
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

  // GET ALL COLUMNS IN A PROJECT
  @Get(':id/columns')
  async fetchProjectColumns(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ) {
    const user_id = req.user.id;
    const columns = await this.projectsService.getAllProjectColumns(
      Number(id),
      user_id,
    );
    return {
      status: true,
      message: 'Request successful',
      data: columns,
    };
  }
}
