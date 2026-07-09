import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'neros_jwt_secret_key',
    });
  }

  async validate(payload: { sub: string; email: string; level: number; tenantId: string; storeId?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException('Usuario nao encontrado');

    return {
      id: user.id,
      email: user.email,
      level: user.level,
      tenantId: user.tenantId,
      storeId: user.storeId,
    };
  }
}
