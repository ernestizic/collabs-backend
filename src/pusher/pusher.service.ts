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
}
