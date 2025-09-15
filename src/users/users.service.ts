import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        omit: { password: true },
      }),
      this.prisma.user.count(),
    ]);

    return {
      users,
      pagination: {
        total: totalUsers,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  }
}
