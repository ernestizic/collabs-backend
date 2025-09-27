import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
