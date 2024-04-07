import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../types/payload.types';

@Injectable()
export class RefreshJWTStrategy extends PassportStrategy(
  Strategy,
  'refreshJWT',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshJWTStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('PUBLIC_KEY'),
    });
  }

  private static extractJWTFromCookie(req: Request): string {
    if (req.cookies['refresh']) {
      return req.cookies['refresh'];
    }
    return null;
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
