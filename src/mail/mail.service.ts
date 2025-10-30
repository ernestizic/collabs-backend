import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

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
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Could not send verification email',
      );
    }
  }

  async sendPasswordResetEmail(email: string, code: string) {
    const message = {
      from: 'support@collabs.com',
      to: email,
      subject: 'Password Reset Instructions',
      text: `Use this code to reset your password: ${code}`,
      html: `<p>Reset your password with this code: <b>${code}</b>. It expires after 10 minutes!</p>`,
    };

    try {
      await this.transporter.sendMail(message);
      return 'Password reset instructions sent!';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Could not send email');
    }
  }

  async sendInviteMail(email: string, code: string) {
    const message = {
      from: 'support@collabs.com',
      to: email,
      subject: 'Invite to collaborate',
      text: `You have been invited to collaborate on a project`,
      html: `<p>You have been invited to collaborate on a project. Click the link below to accept the invite. The link is valid for 7 days </p> <a href="http://localhost:3000/accept-invite?code=${code}" target="_blank" rel="noopener noreferrer">Link</a>`,
    };

    try {
      await this.transporter.sendMail(message);
      return 'Invite sent!';
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Could not send email');
    }
  }
}
