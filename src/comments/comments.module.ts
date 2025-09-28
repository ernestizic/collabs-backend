import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PusherModule } from 'src/pusher/pusher.module';
import { CommentEventsListener } from './comments.eventsListener';

@Module({
  imports: [PusherModule],
  providers: [CommentsService, CommentEventsListener],
  controllers: [CommentsController],
})
export class CommentsModule {}
