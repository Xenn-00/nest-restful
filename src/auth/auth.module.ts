import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AccessJWTStrategy } from './strategies/access.strategy';
import { RefreshJWTStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options: JwtModuleOptions = {
          privateKey: configService.get('PRIVATE_KEY'),
          publicKey: configService.get('PUBLIC_KEY'),
          signOptions: {
            algorithm: 'RS256',
          },
        };
        return options;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessJWTStrategy, RefreshJWTStrategy],
})
export class AuthModule {}
