import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { type AuthRequest } from 'src/utils/types';
import { InviteMemberDto } from './dto/members-dto';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';

@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@Controller('members')
export class MembersController {
  private readonly logger = new Logger(MembersController.name);
  constructor(private readonly membersService: MembersService) {}

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
