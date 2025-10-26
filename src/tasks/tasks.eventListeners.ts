import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PusherService } from 'src/pusher/pusher.service';

@Injectable()
export class TaskEventsListener {
  private logger = new Logger(TaskEventsListener.name);
  constructor(private pusherService: PusherService) {}

  @OnEvent('task.created')
  async handleTaskCreatedEvent(payload: { projectId: number; task: any }) {
    this.logger.log('Task created', payload);
    await this.pusherService.broadcastCreatedTask(
      payload.projectId,
      payload.task,
    );
  }
}
