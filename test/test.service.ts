import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.serivce';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    const getUser = await this.prismaService.user.findUnique({
      where: {
        username: 'test',
      },
    });

    const isHaveToken = await this.prismaService.token.count({
      where: {
        user_id: getUser.id,
      },
    });
    if (!isHaveToken) {
      await this.prismaService.user.deleteMany({
        where: {
          username: 'test',
        },
      });
    } else {
      await this.prismaService.token.deleteMany({
        where: {
          user_id: getUser.id,
        },
      });
      await this.prismaService.user.deleteMany({
        where: {
          username: 'test',
        },
      });
    }
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('testtesttest', 10),
        name: 'test',
      },
    });
  }
}
