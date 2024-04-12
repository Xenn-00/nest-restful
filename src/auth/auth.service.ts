import { HttpException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.serivce';
import { ValidationService } from '../common/validation.service';
import { AuthResponse, SignInRequest, SignUpRequest } from './auth.model';
import { AuthValidation } from './auth.validation';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/payload.types';

@Injectable()
export class AuthService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signUp(request: SignUpRequest): Promise<AuthResponse> {
    this.logger.info(`sign up : ${JSON.stringify(request)}`);
    const signupRequest: SignUpRequest = this.validationService.validate(
      AuthValidation.SIGNUP,
      request,
    );
    const countUsername = await this.prismaService.user.count({
      where: {
        username: signupRequest.username,
      },
    });
    if (countUsername != 0) {
      throw new HttpException('Username is already taken', 400);
    }

    signupRequest.password = await bcrypt.hash(signupRequest.password, 10);
    const response = await this.prismaService.user.create({
      data: signupRequest,
    });

    return {
      id: response.id,
      username: response.username,
    };
  }

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    this.logger.info(`sign in : ${JSON.stringify(request)}`);
    const signInRequest: SignInRequest = this.validationService.validate(
      AuthValidation.SIGNIN,
      request,
    );
    const foundUser = await this.prismaService.user.findUnique({
      where: {
        username: signInRequest.username,
      },
    });
    if (!foundUser)
      throw new HttpException('username or password is invalid', 401);

    const isPasswordValid = await bcrypt.compare(
      signInRequest.password,
      foundUser.password,
    );

    if (!isPasswordValid)
      throw new HttpException('username or password is invalid', 401);

    const payload: JwtPayload = {
      userId: foundUser.id,
      username: foundUser.username,
      name: foundUser.name,
    };

    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prismaService.token.create({
      data: {
        user_id: foundUser.id,
        refresh_token: await bcrypt.hash(refreshToken, 10),
      },
    });

    const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });
    return {
      id: foundUser.id,
      username: foundUser.username,
      tokens: accessToken,
      refresh: refreshToken,
    };
  }

  async logout(userId: string): Promise<string> {
    const checkToken = await this.prismaService.token.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!checkToken)
      throw new HttpException('unaxpected error occur, please login', 403);

    await this.prismaService.token.deleteMany({
      where: {
        user_id: userId,
      },
    });

    return 'OK';
  }

  async refresh(userId: string, refreshToken: string): Promise<AuthResponse> {
    const checkToken = await this.prismaService.token.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!checkToken)
      throw new HttpException('unexpected error occur, please login', 403);

    const compareToken = await bcrypt.compare(
      refreshToken,
      checkToken.refresh_token,
    );

    if (!compareToken)
      throw new HttpException('unexpected error occur, please login', 403);

    const payload = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        name: true,
      },
    });

    const accessToken = this.jwtService.sign(payload, { expiresIn: '10m' });

    return {
      id: payload.id,
      username: payload.username,
      tokens: accessToken,
    };
  }
}
