import {
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PusherService } from './pusher.service';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';

interface PusherAuthBody {
  socket_id: string;
  channel_name: string;
}

@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@Controller('pusher')
export class PusherController {
  constructor(private pusherService: PusherService) {}

  @Post('auth')
  authenticateRequest(
    @Req() req: Request<any, any, PusherAuthBody>,
    @Res() res: Response,
  ) {
    const { socket_id, channel_name } = req.body;

    if (!req.user)
      throw new UnauthorizedException('You are currently logged out');

    const authResponse = this.pusherService
      .getClient()
      .authorizeChannel(socket_id, channel_name);
    res.send(authResponse);
  }
}
