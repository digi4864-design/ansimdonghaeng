import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-kakao'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'
import { UserRole } from '@prisma/client'

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get('KAKAO_CLIENT_ID'),
      clientSecret: config.get('KAKAO_CLIENT_SECRET'),
      callbackURL: '/auth/kakao/callback',
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: any) {
    const { id, username, _json } = profile
    const email = _json?.kakao_account?.email
    return this.authService.socialLogin('kakao', String(id), { name: username, email }, UserRole.ELDER)
  }
}
