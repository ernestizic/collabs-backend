import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async getUsers(@Query('page') page: number) {
    const users = await this.userService.getAllUsers(page);
    return {
      status: true,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const user = await this.userService.getUserById(Number(id));
    return {
      status: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }
}
