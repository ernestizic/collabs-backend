import { Injectable, Logger } from '@nestjs/common';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
  private logger = new Logger(PusherService.name);
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID as string,
      key: process.env.PUSHER_KEY as string,
      secret: process.env.PUSHER_SECRET as string,
      cluster: process.env.PUSHER_CLUSTER as string,
      useTLS: true,
    });
  }

  getClient() {
    return this.pusher;
  }

  async broadcastNewComment(taskId: string, data: any) {
    return this.pusher
      .trigger(`task-${taskId}`, 'new-comment', data)
      .catch((error) => {
        this.logger.error(error);
      });
  }

  async broadcastDeletedColumn(projectId: number, data: { deleted: boolean }) {
    return this.pusher
      .trigger(`private-project-${projectId}`, 'column-deleted', {
        deleted: data.deleted,
        projectId,
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }

  async broadcastCreatedColumn(projectId: number, data: any) {
    return this.pusher
      .trigger(`private-project-${projectId}`, 'column-created', data)
      .catch((error) => {
        this.logger.error(error);
      });
  }

  async broadcastUpdatedColumn(projectId: number, data: any) {
    return this.pusher
      .trigger(`private-project-${projectId}`, 'column-updated', data)
      .catch((error) => {
        this.logger.error(error);
      });
  }

  async broadcastCreatedTask(projectId: number, task: any) {
    return this.pusher
      .trigger(`private-project-${projectId}`, 'task-created', task)
      .catch((error) => {
        this.logger.error(error);
      });
  }

  async broadcastInviteAccepted(projectId: number, member: any) {
    return this.pusher
      .trigger(`private-project-${projectId}`, 'invite-accepted', member)
      .catch((error) => {
        this.logger.error(error);
      });
  }
}
