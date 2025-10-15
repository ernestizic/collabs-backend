import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PusherService } from 'src/pusher/pusher.service';

@Injectable()
export class ProjectEventsListener {
  private logger = new Logger(ProjectEventsListener.name);
  constructor(private pusherService: PusherService) {}

  @OnEvent('column.deleted')
  async handleColumnDeletedEvent(payload: { projectId: number; column: any }) {
    await this.pusherService.broadcastDeletedColumn(payload.projectId, {
      deleted: true,
    });
  }

  @OnEvent('column.created')
  async handleColumnCreatedEvent(payload: { projectId: number; column: any }) {
    await this.pusherService.broadcastCreatedColumn(
      payload.projectId,
      payload.column,
    );
  }

  @OnEvent('column.updated')
  async handleColumnUpdatedEvent(payload: { projectId: number; column: any }) {
    await this.pusherService.broadcastUpdatedColumn(
      payload.projectId,
      payload.column,
    );
  }
}
