import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { UserRole } from '@prisma/client'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('phone')
  phoneLogin(@Body() body: { phone: string; role: UserRole }) {
    return this.authService.phoneLogin(body.phone, body.role)
  }

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin() {}

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoCallback(@Req() req: any) {
    return req.user
  }
}
