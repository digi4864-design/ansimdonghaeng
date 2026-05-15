import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common'
import { AdminService } from './admin.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { ManagerStatus } from '@prisma/client'

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats()
  }

  @Get('bookings')
  getBookings(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllBookings(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )
  }

  @Get('bookings/:id')
  getBooking(@Param('id') id: string) {
    return this.adminService.getBooking(id)
  }

  @Get('managers')
  getManagers(@Query('status') status?: ManagerStatus) {
    return this.adminService.getAllManagers(status)
  }

  @Patch('managers/:id/approve')
  approveManager(@Param('id') id: string) {
    return this.adminService.approveManager(id)
  }

  @Patch('managers/:id/suspend')
  suspendManager(@Param('id') id: string) {
    return this.adminService.suspendManager(id)
  }

  @Get('users')
  getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.adminService.getAllUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    )
  }
}
