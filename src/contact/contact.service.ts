import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.serivce';
import { ContactResponse, CreateContactRequest } from './contact.model';
import { ContactValidation } from './contact.validation';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  async create(
    userId: string,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    const createContactRequest: CreateContactRequest =
      this.validationService.validate(ContactValidation.CREATE, request);

    const data = {
      ...createContactRequest,
      ...{ user_id: userId },
    };

    const response = await this.prismaService.contact.create({
      data: data,
    });

    return response;
  }

  async remove(contactId: string): Promise<string> {
    const checkContact = await this.prismaService.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    if (!checkContact) throw new HttpException('contact is not found', 404);

    await this.prismaService.contact.delete({
      where: {
        id: contactId,
      },
    });
    return 'OK';
  }
}
