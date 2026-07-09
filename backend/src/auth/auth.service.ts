import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tenant: true, store: true },
    });

    if (!user) throw new UnauthorizedException('Credenciais invalidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciais invalidas');

    const payload = {
      sub: user.id,
      email: user.email,
      level: user.level,
      tenantId: user.tenantId,
      storeId: user.storeId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        level: user.level,
        tenant: { id: user.tenant.id, name: user.tenant.name },
        store: user.store ? { id: user.store.id, name: user.store.name } : null,
      },
    };
  }
}
