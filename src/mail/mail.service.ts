import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  async sendEmailVerificationEmail(email: string, code: string) {
    const message = {
      from: 'support@collabs.com',
      to: email,
      subject: 'Email verification Code',
      text: `Verify your email with this: ${code}`,
      html: `<p>Verify your email with this code: <b>${code}</b>. It expires after 10 minutes!</p>`,
    };

    try {
      await this.transporter.sendMail(message);
      return 'Email verification code sent!';
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Could not send verification email',
      );
    }
  }
}
