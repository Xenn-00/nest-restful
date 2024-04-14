import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/guards/access.guard';
import {
  AddressResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
} from './address.model';
import { WebResponse } from '../common/web.model';
import { AddressService } from './address.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@UseGuards(AccessGuard)
@Controller('/api/v1/contacts/:contactId/addresses')
export class AddressController {
  constructor(
    private addressService: AddressService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post()
  @HttpCode(200)
  async create(
    @Param('contactId') contactId: string,
    @Body() request: CreateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    this.logger.info(
      `this is controller speaking, request: ${JSON.stringify(request)}, contactId: ${contactId}`,
    );
    const response = await this.addressService.create(contactId, request);
    return {
      data: response,
    };
  }

  @Get('/:addressId')
  async get(
    @Param('contactId') contactId: string,
    @Param('addressId') addressId: string,
  ): Promise<WebResponse<AddressResponse>> {
    const response = await this.addressService.get(contactId, addressId);
    return {
      data: response,
    };
  }
  @Get()
  async list(
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<AddressResponse[]>> {
    const responses = await this.addressService.list(contactId);
    return {
      data: responses,
    };
  }

  @Patch('/:addressId')
  async update(
    @Param('contactId') contactId: string,
    @Param('addressId') addressId: string,
    @Body() request: UpdateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    const response = await this.addressService.update(
      contactId,
      addressId,
      request,
    );
    return {
      data: response,
    };
  }

  @Delete('/:addressId')
  async remove(
    @Param('contactId') contactId: string,
    @Param('addressId') addressId: string,
  ): Promise<WebResponse<string>> {
    const response = await this.addressService.remove(contactId, addressId);
    return {
      data: response,
    };
  }
}
