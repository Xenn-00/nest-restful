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

  async createContact() {
    const createUser = await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('testtesttest', 10),
        name: 'test',
      },
    });

    await this.prismaService.contact.create({
      data: {
        user_id: createUser.id,
        first_name: 'fuma',
        last_name: 'zakko',
        email: 'test@test.com',
        phone: '+81232135453',
      },
    });
  }

  async getContact() {
    const response = await this.prismaService.contact.findFirst({
      where: {
        first_name: 'fuma',
      },
    });

    return response;
  }

  async createContactMany() {
    const createUser = await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('testtesttest', 10),
        name: 'test',
      },
    });
    const data: {
      user_id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
    }[] = [];

    for (let i = 1; i <= 15; i++) {
      data.push({
        user_id: createUser.id,
        first_name: `fuma ${i}`,
        last_name: `zakko ${i}`,
        email: 'test@test.com',
        phone: '+81232135453',
      });
    }

    await this.prismaService.contact.createMany({
      data: data,
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
