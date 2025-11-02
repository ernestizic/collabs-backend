import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';
import {
  CreateColumnDto,
  CreateProjectDto,
  FetchProjectsDto,
  UpdateColumnDto,
  UpdateColumnPositionsDto,
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

  // Get project by ID
  @Get(':id')
  async getProjectById(@Param('id') id: number, @Req() req: AuthRequest) {
    const userId = req.user.id;
    const project = await this.projectsService.getSingleProject(id, userId);

    return {
      status: true,
      message: 'Project retrived successfully',
      data: project,
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

  @Post(':id/create-column')
  async createColum(
    @Param('id') id: string,
    @Body() payload: CreateColumnDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const column = await this.projectsService.createProjectColumn(
      Number(id),
      userId,
      payload,
    );

    return {
      status: true,
      message: 'Column created',
      data: column,
    };
  }

  @Delete(':projectId/column/:columnId')
  async deleteColumn(
    @Param() param: { projectId: string; columnId: string },
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    await this.projectsService.deleteColumn(param.columnId, userId);

    return {
      status: true,
      message: 'Column deleted',
    };
  }

  @Patch(':projectId/column/:columnId')
  async updateColumn(
    @Param() param: { projectId: string; columnId: string },
    @Body() payload: UpdateColumnDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    await this.projectsService.updateColumn(payload, param.columnId, userId);

    return {
      status: true,
      message: 'Column updated',
    };
  }

  @Put(':projectId/columns')
  async updateColumnsPosition(
    @Param() param: { projectId: string },
    @Body() payload: UpdateColumnPositionsDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    await this.projectsService.updateColumnsPosition(
      userId,
      Number(param.projectId),
      payload.changed_columns,
    );

    return {
      status: true,
      message: 'Column updated',
    };
  }
}
