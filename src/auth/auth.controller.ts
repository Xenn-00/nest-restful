import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  AuthRefreshResponse,
  AuthResponse,
  AuthSignInResponse,
  SignInRequest,
  SignUpRequest,
} from '../model/auth.model';
import { WebResponse } from '../model/web.model';
import { AuthService } from './auth.service';
import { AccessGuard } from './guards/access.guard';
import { RefreshGuard } from './guards/refresh.guard';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post('/sign-up')
  @HttpCode(200)
  async signUp(
    @Body() request: SignUpRequest,
  ): Promise<WebResponse<AuthResponse>> {
    const response = await this.authService.signUp(request);
    return {
      data: response,
    };
  }

  @Post('/sign-in')
  @HttpCode(200)
  async signIn(
    @Body() request: SignInRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebResponse<AuthSignInResponse>> {
    const response = await this.authService.signIn(request);
    res.cookie('refresh', response.refresh, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const authSignInResponse: AuthSignInResponse = {
      id: response.id,
      username: response.username,
      token: response.tokens,
    };
    return {
      data: authSignInResponse,
    };
  }

  @UseGuards(AccessGuard)
  @Get('/logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebResponse<string>> {
    const user = req.user;
    this.logger.debug(user);
    const response = await this.authService.logout(user['userId']);
    res.cookie('refresh', '', {
      maxAge: 0,
    });

    return {
      data: response,
    };
  }

  @UseGuards(RefreshGuard)
  @Get('/refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
  ): Promise<WebResponse<AuthRefreshResponse>> {
    const user = req.user;
    this.logger.debug(user);
    const cookies = req.cookies;
    this.logger.debug(cookies);
    // const response = await this.authService.refresh(user['userId'], cookies);
    // this.logger.debug(user);
    // const authRefreshResponse: AuthRefreshResponse = {
    //   id: response.id,
    //   username: response.username,
    //   token: response.tokens,
    // };
    return null;
  }
}
