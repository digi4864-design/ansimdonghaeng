import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { BookingStatus, BookingStep, TransportMode } from '@prisma/client'

const PLATFORM_FEE_RATE = 0.18

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getElderIdByUserId(userId: string): Promise<string> {
    const elder = await this.prisma.elder.findUnique({ where: { userId } })
    if (!elder) throw new NotFoundException('어르신 프로필이 없습니다. 먼저 프로필을 등록해주세요.')
    return elder.id
  }

  private async getManagerIdByUserId(userId: string): Promise<string> {
    const manager = await this.prisma.manager.findUnique({ where: { userId } })
    if (!manager) throw new NotFoundException('매니저 프로필이 없습니다.')
    return manager.id
  }

  async create(userId: string, dto: {
    hospitalName: string
    hospitalAddress: string
    scheduledAt: Date
    estimatedHours: number
    symptoms?: string
    needsWheelchair: boolean
    specialNote?: string
    price: number
    transportMode?: TransportMode
  }) {
    const elderId = await this.getElderIdByUserId(userId)
    const platformFee = Math.round(dto.price * PLATFORM_FEE_RATE)
    return this.prisma.booking.create({
      data: {
        ...dto,
        elderId,
        platformFee,
        managerPayout: dto.price - platformFee,
        transportMode: dto.transportMode ?? TransportMode.WALKING,
        transportTotal: 0,
      },
    })
  }

  private calcTransportTotal(mode: TransportMode, cost?: number, distanceKm?: number): number {
    switch (mode) {
      case TransportMode.TAXI: return cost ?? 0
      case TransportMode.MANAGER_CAR: return Math.round((distanceKm ?? 0) * 1000)
      case TransportMode.PUBLIC_TRANSIT: return (cost ?? 0) * 2
      case TransportMode.WALKING: return 0
    }
  }

  async submitTransport(bookingId: string, userId: string, dto: {
    transportCost?: number
    distanceKm?: number
  }) {
    const managerId = await this.getManagerIdByUserId(userId)
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.managerId !== managerId) throw new ForbiddenException()
    const transportTotal = this.calcTransportTotal(booking.transportMode, dto.transportCost, dto.distanceKm)
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { transportCost: dto.transportCost, distanceKm: dto.distanceKm, transportTotal },
    })
  }

  async findAllForElder(userId: string) {
    const elder = await this.prisma.elder.findUnique({ where: { userId } })
    if (!elder) return []
    return this.prisma.booking.findMany({
      where: { elderId: elder.id },
      include: { manager: { include: { user: true } }, report: true },
      orderBy: { scheduledAt: 'desc' },
    })
  }

  async findAvailableForManager(userId: string) {
    const managerId = await this.getManagerIdByUserId(userId)
    const manager = await this.prisma.manager.findUnique({ where: { id: managerId } })
    if (!manager) throw new NotFoundException()
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        managerId: null,
      },
      include: { elder: { include: { user: true } } },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async applyAsManager(bookingId: string, userId: string) {
    const managerId = await this.getManagerIdByUserId(userId)
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new NotFoundException()
    if (booking.status !== BookingStatus.PENDING) throw new ForbiddenException('이미 매칭된 예약입니다.')
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { managerId, status: BookingStatus.MATCHED },
    })
  }

  async updateStep(bookingId: string, userId: string, step: BookingStep) {
    const managerId = await this.getManagerIdByUserId(userId)
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.managerId !== managerId) throw new ForbiddenException()
    const status = step === BookingStep.COMPLETED ? BookingStatus.COMPLETED : BookingStatus.IN_PROGRESS
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { currentStep: step, status },
    })
  }

  async createReport(bookingId: string, userId: string, dto: {
    summary: string
    nextAppointment?: Date
    medications?: string
    doctorInstructions?: string
  }) {
    const managerId = await this.getManagerIdByUserId(userId)
    return this.prisma.treatmentReport.create({
      data: { bookingId, managerId, ...dto },
    })
  }

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        elder: { include: { user: true } },
        manager: { include: { user: true } },
        report: true,
        reviews: true,
      },
    })
    if (!booking) throw new NotFoundException()
    return booking
  }

  async cancel(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { elder: true },
    })
    if (!booking) throw new NotFoundException()
    if (booking.elder.userId !== userId) throw new ForbiddenException()
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new ForbiddenException('취소할 수 없는 상태입니다.')
    }
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    })
  }
}
