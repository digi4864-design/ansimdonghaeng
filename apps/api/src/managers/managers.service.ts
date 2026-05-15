import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ManagerStatus } from '@prisma/client'

@Injectable()
export class ManagersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { area?: string; minRating?: number }) {
    return this.prisma.manager.findMany({
      where: {
        status: ManagerStatus.APPROVED,
        ...(filters?.area && { serviceAreas: { contains: filters.area } }),
        ...(filters?.minRating && { rating: { gte: filters.minRating } }),
      },
      include: { user: true, certifications: true },
      orderBy: { rating: 'desc' },
    })
  }

  async findById(id: string) {
    const manager = await this.prisma.manager.findUnique({
      where: { id },
      include: { user: true, certifications: true, availableHours: true },
    })
    if (!manager) throw new NotFoundException()
    return manager
  }

  async updateProfile(userId: string, data: {
    bio?: string
    serviceAreas?: string[]
  }) {
    const updateData: any = { ...data }
    if (data.serviceAreas !== undefined) {
      updateData.serviceAreas = JSON.stringify(data.serviceAreas)
    }
    return this.prisma.manager.update({
      where: { userId },
      data: updateData,
    })
  }

  async addCertification(userId: string, data: {
    type: any
    name: string
    issuedBy: string
    issuedAt: Date
    fileUrl?: string
  }) {
    const manager = await this.prisma.manager.findUnique({ where: { userId } })
    if (!manager) throw new NotFoundException()
    return this.prisma.certification.create({
      data: { managerId: manager.id, ...data },
    })
  }

  async setAvailableHours(userId: string, hours: { dayOfWeek: number; startHour: number; endHour: number }[]) {
    const manager = await this.prisma.manager.findUnique({ where: { userId } })
    if (!manager) throw new NotFoundException()
    await this.prisma.availableHour.deleteMany({ where: { managerId: manager.id } })
    return this.prisma.availableHour.createMany({
      data: hours.map((h) => ({ ...h, managerId: manager.id })),
    })
  }
}
