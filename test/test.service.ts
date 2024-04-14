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
  async createAddress() {
    const createUser = await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('testtesttest', 10),
        name: 'test',
      },
    });

    const createContact = await this.prismaService.contact.create({
      data: {
        user_id: createUser.id,
        first_name: 'fuma',
        last_name: 'zakko',
        email: 'test@test.com',
        phone: '+81232135453',
      },
    });

    const data = {
      street: 'test street',
      city: 'test city',
      province: 'test province',
      country: 'test country',
      postal_code: '51161',
      ...{ contact_id: createContact.id },
    };

    await this.prismaService.address.create({
      data: data,
    });
  }
  async createAddressMany() {
    const createUser = await this.prismaService.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('testtesttest', 10),
        name: 'test',
      },
    });

    const createContact = await this.prismaService.contact.create({
      data: {
        user_id: createUser.id,
        first_name: 'fuma',
        last_name: 'zakko',
        email: 'test@test.com',
        phone: '+81232135453',
      },
    });

    const data: {
      contact_id: string;
      street: string;
      city: string;
      province: string;
      country: string;
      postal_code: string;
    }[] = [];
    for (let i = 1; i <= 10; i++) {
      data.push({
        contact_id: createContact.id,
        street: `street test ${i}`,
        city: `city test ${i}`,
        province: `province test ${i}`,
        country: `country test ${i}`,
        postal_code: `77284${i}`,
      });
    }

    await this.prismaService.address.createMany({
      data: data,
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

  async getAddress() {
    const contact = await this.getContact();
    const response = await this.prismaService.address.findFirst({
      where: {
        contact_id: contact.id,
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
