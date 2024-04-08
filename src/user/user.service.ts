import { HttpException, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.serivce';
import { ValidationService } from '../common/validation.service';
import { UserResponse, UserUpdateRequest } from '../model/user.model';
import { Logger } from 'winston';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private prismaService: PrismaService,
  ) {}

  async current(user: User): Promise<UserResponse> {
    const response: UserResponse = {
      id: user.id,
      username: user.username,
      name: user.name,
    };
    this.logger.info(response);
    return response;
  }

  async update(
    userId: string,
    request: UserUpdateRequest,
  ): Promise<UserResponse> {
    this.logger.info(userId);
    this.logger.info(`update request: ${JSON.stringify(request)}`);
    const updateRequest: UserUpdateRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );

    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user)
      throw new HttpException('user with provided id, is not found!', 404);

    if (updateRequest.name) {
      user.name = updateRequest.name;
    }

    if (updateRequest.password) {
      if (updateRequest.password !== updateRequest.confirmPassword)
        throw new HttpException("password doesn't match", 400);
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    if (updateRequest.username) {
      const countUsername = await this.prismaService.user.count({
        where: {
          username: updateRequest.username,
        },
      });
      if (countUsername)
        throw new HttpException(
          'username is already taken, please change',
          400,
        );

      user.username = updateRequest.username;
    }

    const response = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        username: user.username,
        password: user.password,
        name: user.name,
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    return {
      id: response.id,
      username: response.username,
      name: response.name,
    };
  }
}
