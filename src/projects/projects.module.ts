import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TasksModule } from 'src/tasks/tasks.module';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [TasksModule, MembersModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
