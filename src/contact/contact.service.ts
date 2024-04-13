import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from '../common/validation.service';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.serivce';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from './contact.model';
import { ContactValidation } from './contact.validation';
import { WebResponse } from '../common/web.model';
import { Contact } from '@prisma/client';

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
    this.logger.debug(`create contact request : ${JSON.stringify(request)}`);
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

  async get(contactId: string): Promise<ContactResponse> {
    const response = await this.prismaService.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    if (!response) throw new HttpException('contact is not found', 404);
    return response;
  }

  async remove(contactId: string): Promise<string> {
    const checkContact = await this.get(contactId);

    if (!checkContact) throw new HttpException('contact is not found', 404);

    await this.prismaService.contact.delete({
      where: {
        id: contactId,
      },
    });
    return 'OK';
  }

  async update(
    contactId: string,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(`update contact request : ${JSON.stringify(request)}`);
    const contact = await this.prismaService.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    if (!contact) throw new HttpException('contact is not found', 404);

    const updateContactRequest: UpdateContactRequest =
      this.validationService.validate(ContactValidation.UPDATE, request);

    if (updateContactRequest.first_name) {
      contact.first_name = updateContactRequest.first_name;
    }

    if (updateContactRequest.last_name) {
      contact.last_name = updateContactRequest.last_name;
    }

    if (updateContactRequest.email) {
      contact.email = updateContactRequest.email;
    }

    if (updateContactRequest.phone) {
      contact.phone = updateContactRequest.phone;
    }

    const response = await this.prismaService.contact.update({
      where: {
        id: contactId,
      },
      data: {
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
      },
    });

    return response;
  }
  toContactResponse(contact: Contact): ContactResponse {
    return {
      id: contact.id,
      user_id: contact.user_id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
    };
  }

  async search(
    userId: string,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const searchContactRequest: SearchContactRequest =
      this.validationService.validate(ContactValidation.SEARCH, request);

    const filters = [];

    if (searchContactRequest.name) {
      filters.push({
        OR: [
          {
            first_name: {
              contains: searchContactRequest.name,
            },
          },
          {
            last_name: {
              contains: searchContactRequest.name,
            },
          },
        ],
      });
    }

    if (searchContactRequest.email) {
      filters.push({
        email: {
          contains: searchContactRequest.email,
        },
      });
    }

    if (searchContactRequest.phone) {
      filters.push({
        phone: {
          contains: searchContactRequest.phone,
        },
      });
    }

    const skip = (searchContactRequest.page - 1) * searchContactRequest.size;

    const contacts = await this.prismaService.contact.findMany({
      where: {
        user_id: userId,
        AND: filters,
      },
      take: searchContactRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.contact.count({
      where: {
        user_id: userId,
        AND: filters,
      },
    });
    return {
      data: contacts.map((contact) => this.toContactResponse(contact)),
      paging: {
        current_page: searchContactRequest.page,
        size: searchContactRequest.size,
        total_page: Math.ceil(total / searchContactRequest.size),
      },
    };
  }
}
