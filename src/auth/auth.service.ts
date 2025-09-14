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

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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

    // login user
    const loggedinUser = await this.validateUser(email, password);
    return loggedinUser;
  }
}
