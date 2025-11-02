import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MailModule } from 'src/mail/mail.module';
import { PusherModule } from 'src/pusher/pusher.module';
import { MembersEventsListeners } from './members.eventsListeners';
import { MembersController } from './members.controller';

@Module({
  imports: [MailModule, PusherModule],
  providers: [MembersService, MembersEventsListeners],
  exports: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
