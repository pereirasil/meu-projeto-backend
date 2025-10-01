import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your-super-secret-jwt-key-here-2024',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - Payload:', payload);
    // Retornar dados do payload no formato correto
    return { sub: payload.sub, email: payload.email };
  }
}
