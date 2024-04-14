import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.serivce';
import { ValidationService } from '../common/validation.service';
import { ContactService } from '../contact/contact.service';
import {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from './address.model';
import { AddressValidation } from './address.validation';
import { Address } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
  ) {}
  async create(
    contactId: string,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `create address request : ${JSON.stringify(request)}; contactId : ${contactId}`,
    );

    const createAddressRequest: CreateAddressRequest =
      this.validationService.validate(AddressValidation.CREATE, request);

    await this.contactService.get(contactId);

    const data = {
      ...createAddressRequest,
      ...{ contact_id: contactId },
    };

    const response = await this.prismaService.address.create({
      data: data,
    });
    return response;
  }

  async get(contactId: string, addressId: string): Promise<AddressResponse> {
    await this.contactService.get(contactId);
    const response = await this.prismaService.address.findFirst({
      where: {
        id: addressId,
        contact_id: contactId,
      },
    });

    if (!response) throw new HttpException('address is not found', 404);
    return response;
  }
  private toAddressResponse(address: Address): AddressResponse {
    return {
      id: address.id,
      contact_id: address.contact_id,
      city: address.city,
      province: address.province,
      country: address.country,
      postal_code: address.postal_code,
    };
  }
  async list(contactId: string): Promise<AddressResponse[]> {
    await this.contactService.get(contactId);
    const responses = await this.prismaService.address.findMany({
      where: {
        contact_id: contactId,
      },
    });
    return responses.map((response) => this.toAddressResponse(response));
  }

  async update(
    contactId: string,
    addressId: string,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    const updateAddressRequest: UpdateAddressRequest =
      this.validationService.validate(AddressValidation.UPDATE, request);
    const address = await this.get(contactId, addressId);
    if (!address) throw new HttpException('address is not found', 404);
    const response = await this.prismaService.address.update({
      where: {
        id: addressId,
        contact_id: contactId,
      },
      data: {
        street: updateAddressRequest.street
          ? updateAddressRequest.street
          : address.street,
        city: updateAddressRequest.city
          ? updateAddressRequest.city
          : address.city,
        province: updateAddressRequest.province
          ? updateAddressRequest.province
          : address.province,
        country: updateAddressRequest.country
          ? updateAddressRequest.country
          : address.country,
        postal_code: updateAddressRequest.postal_code
          ? updateAddressRequest.postal_code
          : address.postal_code,
      },
    });
    return response;
  }

  async remove(contactId: string, addressId: string): Promise<string> {
    await this.get(contactId, addressId);
    await this.prismaService.address.delete({
      where: {
        id: addressId,
      },
    });
    return 'OK';
  }
}
