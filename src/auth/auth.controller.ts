import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(ValidationPipe)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);
    return {
      status: true,
      message: 'Login successfull',
      data: user,
    };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe)
  async signup(@Body() signupDto: SignupDto) {
    const user = await this.authService.signUp(signupDto);
    return {
      status: true,
      message: 'User creation successfull',
      data: user,
    };
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
    await this.authService.verifyCode(email, code);

    return {
      status: true,
      message: 'Email verification successful',
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
}
