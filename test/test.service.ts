import { Injectable } from '@nestjs/common';
import { PrismaService } from '../src/common/prisma.serivce';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser(username: string = 'test') {
    await this.prismaService.user.deleteMany({
      where: {
        username: username,
      },
    });
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

  async deleteContact(userId: string) {
    await this.prismaService.contact.deleteMany({
      where: {
        user_id: userId,
      },
    });
  }
}
