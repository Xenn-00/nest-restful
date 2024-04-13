import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/guards/access.guard';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from './contact.model';
import { Request } from 'express';
import { WebResponse } from '../common/web.model';
import { ContactService } from './contact.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@UseGuards(AccessGuard)
@Controller('/api/v1/contacts')
export class ContactController {
  constructor(
    private contactService: ContactService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}
  @Post()
  @HttpCode(200)
  async create(
    @Body() requestBody: CreateContactRequest,
    @Req() req: Request,
  ): Promise<WebResponse<ContactResponse>> {
    const user = req.user;
    const response = await this.contactService.create(
      user['userId'],
      requestBody,
    );
    return {
      data: response,
    };
  }

  @Get('/:contactId')
  @HttpCode(200)
  async get(
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<ContactResponse>> {
    const response = await this.contactService.get(contactId);
    return {
      data: response,
    };
  }

  @Patch('/:contactId')
  @HttpCode(200)
  async update(
    @Param('contactId') contactId: string,
    @Body() request: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const response = await this.contactService.update(contactId, request);
    return {
      data: response,
    };
  }

  @Delete('/:contactId')
  @HttpCode(200)
  async remove(
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<string>> {
    const response = await this.contactService.remove(contactId);
    return {
      data: response,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Req() req: Request,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ContactResponse[]>> {
    const user = req.user;
    const request: SearchContactRequest = {
      name: name,
      email: email,
      phone: phone,
      page: page || 1,
      size: size || 10,
    };

    return this.contactService.search(user['userId'], request);
  }
}
