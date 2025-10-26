import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { SignedUser } from 'src/utils/types';
// import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   // eslint-disable-next-line
      //   (req: Request) => req?.cookies?.access_token,
      // ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  validate(user: SignedUser) {
    return user;
  }
}
