import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PusherService } from 'src/pusher/pusher.service';

@Injectable()
export class MembersEventsListeners {
  private logger = new Logger(MembersEventsListeners.name);
  constructor(private readonly pusherService: PusherService) {}

  @OnEvent('invite.accepted')
  async handleInviteAcceptedEvent(payload: { projectId: number; member: any }) {
    await this.pusherService.broadcastInviteAccepted(
      payload.projectId,
      payload.member,
    );
    this.logger.log(`Triggered push event for accepted invite`);
  }
}
