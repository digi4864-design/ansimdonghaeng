import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BookingStatus, ManagerStatus } from '@prisma/client'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [totalBookings, inProgress, pendingManagers, todayCompleted] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: BookingStatus.IN_PROGRESS } }),
      this.prisma.manager.count({ where: { status: ManagerStatus.PENDING } }),
      this.prisma.booking.count({
        where: { status: BookingStatus.COMPLETED, updatedAt: { gte: today, lt: tomorrow } },
      }),
    ])

    return { totalBookings, inProgress, pendingManagers, todayCompleted }
  }

  async getAllBookings(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        skip,
        take: limit,
        include: {
          elder: { include: { user: true } },
          manager: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count(),
    ])
    return { bookings, total, page, limit }
  }

  async getBooking(id: string) {
    return this.prisma.booking.findUniqueOrThrow({
      where: { id },
      include: {
        elder: { include: { user: true } },
        manager: { include: { user: true } },
      },
    })
  }

  async getAllManagers(status?: ManagerStatus) {
    return this.prisma.manager.findMany({
      where: status ? { status } : undefined,
      include: { user: true, certifications: true },
      orderBy: { id: 'desc' },
    })
  }

  async approveManager(managerId: string) {
    return this.prisma.manager.update({
      where: { id: managerId },
      data: { status: ManagerStatus.APPROVED },
    })
  }

  async suspendManager(managerId: string) {
    return this.prisma.manager.update({
      where: { id: managerId },
      data: { status: ManagerStatus.SUSPENDED },
    })
  }

  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ])
    return { users, total, page, limit }
  }
}
