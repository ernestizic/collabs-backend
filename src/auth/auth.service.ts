import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) throw new NotFoundException('User does not exist');

    const { password, ...result } = user;
    const passwordMatch = await bcrypt.compare(pass, password);

    if (!passwordMatch)
      throw new UnauthorizedException('Password is incorrect');

    const access_token = await this.jwtService.signAsync(result);
    return {
      user: result,
      access_token,
    };
  }

  async sendVerificationCode(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { EmailVerification: true },
    });

    if (!user)
      throw new BadRequestException(
        'Unable to send verification code to email. User not found',
      );

    const code = crypto.randomInt(100000, 999999).toString();

    // store code
    await this.prisma.emailVerification.create({
      data: {
        code,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
        user: { connect: { id: user.id } },
      },
    });

    // send email
    this.mailService
      .sendEmailVerificationEmail(user.email, code)
      .catch((err) => {
        this.logger.error(err);
      });

    return { message: 'Verification code sent' };
  }

  async verifyCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { EmailVerification: true },
    });

    if (!user) throw new BadRequestException('User not found');

    if (user.email_verified_at !== null)
      throw new BadRequestException('This email is already verified');

    const latestCode = await this.prisma.emailVerification.findFirst({
      where: { userId: user.id, type: 'EMAIL_VERIFICATION' },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestCode) throw new BadRequestException('No verification code');

    if (latestCode.code !== code) throw new BadRequestException('Invalid code');

    if (latestCode.expiresAt < new Date())
      throw new BadRequestException('This code has expired');

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { email_verified_at: new Date() },
      omit: { password: true },
    });

    return updatedUser;
  }

  async signUp(payload: Prisma.UserCreateInput) {
    const { email, password } = payload;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user)
      throw new BadRequestException('User already exists with this email');

    const hashedPassword = await bcrypt.hash(password, 10);

    const secureUserData = {
      ...payload,
      password: hashedPassword,
    };

    // create user
    const newUser = await this.prisma.user.create({ data: secureUserData });
    const { password: _, ...restOfUser } = newUser;

    const access_token = await this.jwtService.signAsync(restOfUser);

    // send user email verification code
    // TODO - add this to jobs later
    this.sendVerificationCode(email).catch((err) =>
      this.logger.error('Failed to send verification email', err),
    );

    // login user
    return {
      user: restOfUser,
      access_token,
    };
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email },
      include: { EmailVerification: true },
    });

    if (!user)
      throw new BadRequestException('User with this email does not exist');

    const code = crypto.randomInt(100000, 999999).toString();
    await this.prisma.emailVerification.create({
      data: {
        code,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
        user: { connect: { id: user.id } },
      },
    });
    this.mailService.sendPasswordResetEmail(email, code).catch((err) => {
      this.logger.error(err);
    });
    return 'Password reset instructions sent';
  }

  async resetPassword(email: string, password: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user)
      throw new BadRequestException('User with this email does not exist');

    const latestCode = await this.prisma.emailVerification.findFirst({
      where: { userId: user.id, type: 'PASSWORD_RESET' },
      orderBy: { createdAt: 'desc' },
    });

    if (!password) throw new BadRequestException('Password is required');
    if (!latestCode)
      throw new BadRequestException(
        'Please request for a verification code to be sent',
      );
    if (latestCode.code !== code)
      throw new BadRequestException('Code is incorrect');
    if (latestCode.expiresAt < new Date())
      throw new BadRequestException('This code has expired');

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    return 'Password updated';
  }

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });

    if (!user) throw new NotFoundException('User not found!');

    return user;
  }
}
