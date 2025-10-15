import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TasksModule } from 'src/tasks/tasks.module';
import { MembersModule } from 'src/members/members.module';
import { PusherModule } from 'src/pusher/pusher.module';
import { ProjectEventsListener } from './projects.eventListeners';

@Module({
  imports: [TasksModule, MembersModule, PusherModule],
  providers: [ProjectsService, ProjectEventsListener],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
