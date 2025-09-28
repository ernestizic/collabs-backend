import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PusherService } from 'src/pusher/pusher.service';

@Injectable()
export class CommentEventsListener {
  private logger = new Logger(CommentEventsListener.name);
  constructor(private readonly pusherService: PusherService) {}

  @OnEvent('comment.created')
  async handleCommentCreatedEvent(payload: { taskId: string; comment: any }) {
    await this.pusherService.broadcastNewComment(
      payload.taskId,
      payload.comment,
    );
    this.logger.debug(`Triggered push event for task-${payload.taskId}`);
  }
}
