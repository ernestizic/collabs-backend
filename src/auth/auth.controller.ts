import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  LoginDto,
  ResetPasswordDto,
  SignupDto,
  VerificationEmailDto,
  VerifyEmailDto,
} from './dto/auth-dto';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { type AuthRequest } from 'src/utils/types';
import { EmailVerifiedGuard } from 'src/utils/guards/EmailVerifiedGuard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = loginDto;
    const { user, access_token } = await this.authService.validateUser(
      email,
      password,
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      status: true,
      message: 'Login successfull',
      data: user,
    };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe)
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, access_token } = await this.authService.signUp(signupDto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return {
      status: true,
      message: 'User creation successfull',
      data: user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { status: true, message: 'Logged out successfully' };
  }

  @Post('send-verification-code')
  @UsePipes(ValidationPipe)
  async sendVerificationEmail(@Body() payload: VerificationEmailDto) {
    await this.authService.sendVerificationCode(payload.email);

    return {
      status: true,
      message: 'Verification email sent',
    };
  }

  @Post('verify-code')
  @UsePipes(ValidationPipe)
  async verifyEmail(@Body() payload: VerifyEmailDto) {
    const { email, code } = payload;
    const user = await this.authService.verifyCode(email, code);

    return {
      status: true,
      message: 'Email verification successful',
      data: user,
    };
  }

  @Post('forgot-password')
  async sendForgotPasswordCode(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');

    const res = await this.authService.sendPasswordResetEmail(email);
    return {
      status: true,
      message: res,
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() payload: ResetPasswordDto) {
    const { email, password, code } = payload;
    await this.authService.resetPassword(email, password, code);

    return {
      status: true,
      message: 'Password updated',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: AuthRequest) {
    const user = await this.authService.getUser(req.user.id);

    return {
      status: true,
      message: 'User returned successfully',
      user,
    };
  }
}
