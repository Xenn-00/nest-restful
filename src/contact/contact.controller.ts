import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/guards/access.guard';
import { ContactResponse, CreateContactRequest } from './contact.model';
import { Request } from 'express';
import { WebResponse } from '../common/web.model';
import { ContactService } from './contact.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@UseGuards(AccessGuard)
@Controller('/api/v1/contacts')
export class ContactController {
  constructor(
    private contactSerice: ContactService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}
  @Post()
  @HttpCode(200)
  async create(
    @Body() requestBody: CreateContactRequest,
    @Req() req: Request,
  ): Promise<WebResponse<ContactResponse>> {
    const user = req.user;
    const response = await this.contactSerice.create(user['userId'], requestBody);
    return {
      data: response,
    };
  }
}
