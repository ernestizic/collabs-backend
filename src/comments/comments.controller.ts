import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comments.dto';
import { type AuthRequest } from 'src/utils/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';

@Controller('tasks/:taskid/comments')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async getAllTaskComments(
    @Query('page') page: number,
    @Param('taskid') taskid: string,
  ) {
    const response = await this.commentsService.getComments(taskid, page);

    return {
      status: true,
      message: 'Request successful',
      data: response,
    };
  }

  @Post()
  async createComment(
    @Body() payload: CreateCommentDto,
    @Param('taskid') taskid: string,
    @Request() req: AuthRequest,
  ) {
    const userId = req.user.id;
    const comment = await this.commentsService.createComment(
      userId,
      taskid,
      payload,
    );

    return {
      status: true,
      message: 'Request successful',
      data: comment,
    };
  }

  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string) {
    await this.commentsService.deleteComment(commentId);

    return {
      status: true,
      message: 'Comment deleted',
    };
  }
}
