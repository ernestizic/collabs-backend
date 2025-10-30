import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PusherModule } from 'src/pusher/pusher.module';
import { TaskEventsListener } from './tasks.eventListeners';

@Module({
  imports: [PusherModule],
  controllers: [TasksController],
  providers: [TasksService, TaskEventsListener],
  exports: [TasksService],
})
export class TasksModule {}
