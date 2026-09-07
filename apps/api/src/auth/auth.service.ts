import { randomBytes, createHash } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken) private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    const rawRefreshToken = randomBytes(48).toString('base64url');
    const refreshTokenExpiresInDays = this.configService.get<number>('jwt.refreshTokenExpiresInDays')!;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresInDays);

    await this.refreshTokensRepository.save(
      this.refreshTokensRepository.create({
        userId: user.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt,
        revokedAt: null,
      }),
    );

    return { accessToken, refreshToken: rawRefreshToken };
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(email);
    const passwordMatches = user ? await this.usersService.verifyPassword(user, password) : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    return this.issueTokenPair(user);
  }

  async refresh(rawToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokensRepository.findOne({
      where: { tokenHash, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      relations: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    stored.revokedAt = new Date();
    await this.refreshTokensRepository.save(stored);

    return this.issueTokenPair(stored.user);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokensRepository.update({ tokenHash }, { revokedAt: new Date() });
  }
}
