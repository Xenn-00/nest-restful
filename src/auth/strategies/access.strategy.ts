import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/payload.types';

@Injectable()
export class AccessJWTStrategy extends PassportStrategy(Strategy, 'accessJWT') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('PUBLIC_KEY'),
      algorithm: ['RS256'],
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
