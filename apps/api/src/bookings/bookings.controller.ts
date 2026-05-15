import { Controller, Get, Post, Patch, Body, Param, UseGuards, Delete } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { User, BookingStep } from '@prisma/client'

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles('ELDER', 'GUARDIAN')
  create(@CurrentUser() user: User, @Body() body: any) {
    return this.bookingsService.create(user.id, body)
  }

  @Get('my')
  @Roles('ELDER', 'GUARDIAN')
  myBookings(@CurrentUser() user: User) {
    return this.bookingsService.findAllForElder(user.id)
  }

  @Get('available')
  @Roles('MANAGER')
  availableBookings(@CurrentUser() user: User) {
    return this.bookingsService.findAvailableForManager(user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id)
  }

  @Post(':id/apply')
  @Roles('MANAGER')
  apply(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.applyAsManager(id, user.id)
  }

  @Patch(':id/step')
  @Roles('MANAGER')
  updateStep(@Param('id') id: string, @CurrentUser() user: User, @Body() body: { step: BookingStep }) {
    return this.bookingsService.updateStep(id, user.id, body.step)
  }

  @Patch(':id/transport')
  @Roles('MANAGER')
  submitTransport(@Param('id') id: string, @CurrentUser() user: User, @Body() body: any) {
    return this.bookingsService.submitTransport(id, user.id, body)
  }

  @Post(':id/report')
  @Roles('MANAGER')
  createReport(@Param('id') id: string, @CurrentUser() user: User, @Body() body: any) {
    return this.bookingsService.createReport(id, user.id, body)
  }

  @Delete(':id')
  @Roles('ELDER', 'GUARDIAN')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.cancel(id, user.id)
  }
}
