import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { type AuthRequest } from 'src/utils/types';
import { InviteMemberDto, UpdateMemberDto } from './dto/members-dto';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';

@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@Controller('members')
export class MembersController {
  private readonly logger = new Logger(MembersController.name);
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async getProjectMembers(
    @Query('projectId') projectId: number,
    @Req() req: AuthRequest,
  ) {
    if (!projectId) throw new BadRequestException('Project ID is required');

    const userId = req.user.id;
    const members = await this.membersService.getAllProjectMembers(
      projectId,
      userId,
    );

    return {
      status: true,
      message: 'Request successful',
      data: members,
    };
  }

  @Delete(':id')
  async removeProjectMember(
    @Param('id') id: number,
    @Query('projectId') projectId: number,
    @Req() req: AuthRequest,
  ) {
    if (!projectId) throw new BadRequestException('Project ID is required');

    const userId = req.user.id;
    await this.membersService.deleteMember(userId, projectId, id);

    return {
      status: true,
      message: 'Member removed successfully',
    };
  }

  @Put(':id')
  async updateProjectMember(
    @Param('id') id: number,
    @Body() payload: UpdateMemberDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    await this.membersService.updateMember(userId, id, payload);

    return {
      status: true,
      message: 'Member updated',
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
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const res = await this.membersService.acceptInvite(code, userId);

    return {
      status: true,
      message: 'Invite accepted',
      data: res,
    };
  }
}
