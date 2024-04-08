import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/guards/access.guard';
import { Request } from 'express';
import { WebResponse } from '../model/web.model';
import { UserResponse, UserUpdateRequest } from '../model/user.model';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@UseGuards(AccessGuard)
@Controller('/api/v1/users')
export class UserController {
  constructor(
    private userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Get('/current')
  @HttpCode(200)
  async current(@Req() req: Request): Promise<WebResponse<UserResponse>> {
    const user = req.user;
    const response = await this.userService.current(user as User);
    return {
      data: response,
    };
  }

  @Patch('/current/update')
  @HttpCode(200)
  async update(
    @Body() request: UserUpdateRequest,
    @Req() req: Request,
  ): Promise<WebResponse<UserResponse>> {
    const user = req.user;
    const response = await this.userService.update(user['userId'], request);
    return {
      data: response,
    };
  }
}
