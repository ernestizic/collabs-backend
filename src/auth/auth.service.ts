import {
  BadRequestException,
  Injectable,
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

    if (passwordMatch) {
      const loggedUser = {
        ...result,
        access_token: await this.jwtService.signAsync(result),
      };
      return loggedUser;
    } else {
      throw new UnauthorizedException('Password is incorrect');
    }
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
    await this.mailService.sendEmailVerificationEmail(user.email, code);

    return { message: 'Verification code sent' };
  }

  async verifyCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { EmailVerification: true },
    });

    if (!user) throw new BadRequestException('User not found');

    const latestCode = await this.prisma.emailVerification.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestCode) throw new BadRequestException('No verification code');

    if (latestCode.code !== code) throw new BadRequestException('Invalid code');

    if (latestCode.expiresAt < new Date())
      throw new BadRequestException('This code has expired');

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { email_verified_at: new Date() },
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
    await this.prisma.user.create({ data: secureUserData });
    // send user email verification code
    await this.sendVerificationCode(email);

    // login user
    const loggedinUser = await this.validateUser(email, password);
    return loggedinUser;
  }
}
