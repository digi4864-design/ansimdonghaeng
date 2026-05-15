import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { elder: true, guardian: true, manager: true },
    })
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.')
    return user
  }

  async updateProfile(id: string, data: { name?: string; profileImageUrl?: string }) {
    return this.prisma.user.update({ where: { id }, data })
  }

  async updatePhone(id: string, phone: string) {
    return this.prisma.user.update({ where: { id }, data: { phone } })
  }
}
