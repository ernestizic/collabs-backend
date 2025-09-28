import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/comments.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CommentsService {
  private logger = new Logger(CommentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getComments(taskId: string, page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [comments, totalComments] = await Promise.all([
      this.prisma.comment.findMany({ where: { taskId }, skip, take: limit }),
      this.prisma.comment.count({ where: { taskId } }),
    ]);

    return {
      comments,
      pagination: {
        total: totalComments,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalComments / limit),
      },
    };
  }

  async createComment(
    userId: number,
    taskId: string,
    payload: CreateCommentDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { column: { include: { project: true } } },
    });
    if (!task) throw new NotFoundException('Task with ID not found');

    const member = await this.prisma.collaborator.findUnique({
      where: {
        userId_projectId: { userId, projectId: task?.column.projectId },
      },
    });
    if (!member)
      throw new ForbiddenException(
        'You are not allowed to perform this action',
      );

    const newComment = await this.prisma.comment.create({
      data: {
        text: payload.text,
        user: { connect: { id: userId } },
        task: { connect: { id: task.id } },
      },
    });
    this.eventEmitter.emit('comment.created', {
      taskId: taskId,
      comment: newComment,
    });
    return newComment;
  }

  async deleteComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('This comment cannot be found');

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
