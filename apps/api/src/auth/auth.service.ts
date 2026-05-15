import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'
import { PrismaService } from '../prisma/prisma.service'
import { UserRole } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async socialLogin(provider: string, socialId: string, profile: { name: string; email?: string; phone?: string }, role: UserRole) {
    let user = await this.prisma.user.findFirst({
      where: { socialProvider: provider, socialId },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          role,
          name: profile.name,
          phone: profile.phone ?? '',
          email: profile.email,
          socialProvider: provider,
          socialId,
        },
      })
    }

    return this.issueToken(user.id, user.role)
  }

  async phoneLogin(phone: string, role: UserRole) {
    let user = await this.prisma.user.findUnique({ where: { phone } })
    if (!user) {
      user = await this.prisma.user.create({ data: { role, name: '', phone } })
      await this.createRoleProfile(user.id, role)
    }
    return this.issueToken(user.id, user.role)
  }

  private async createRoleProfile(userId: string, role: UserRole) {
    if (role === UserRole.ELDER) {
      await this.prisma.elder.create({ data: { userId, birthYear: 1950, address: '' } })
    } else if (role === UserRole.MANAGER) {
      await this.prisma.manager.create({ data: { userId } })
    } else if (role === UserRole.GUARDIAN) {
      await this.prisma.guardian.create({ data: { userId } })
    }
  }

  private issueToken(userId: string, role: UserRole) {
    const payload = { sub: userId, role }
    return {
      accessToken: this.jwtService.sign(payload),
      userId,
      role,
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UnauthorizedException()
    return user
  }
}
