import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth-dto';
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
}
