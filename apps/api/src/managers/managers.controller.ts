import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ManagersService } from './managers.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { User } from '@prisma/client'

@Controller('managers')
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get()
  findAll(@Query('area') area?: string, @Query('minRating') minRating?: string) {
    return this.managersService.findAll({
      area,
      minRating: minRating ? parseFloat(minRating) : undefined,
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.managersService.findById(id)
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  updateProfile(@CurrentUser() user: User, @Body() body: { bio?: string; serviceAreas?: string[] }) {
    return this.managersService.updateProfile(user.id, body)
  }

  @Post('me/certifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  addCertification(@CurrentUser() user: User, @Body() body: any) {
    return this.managersService.addCertification(user.id, body)
  }

  @Post('me/available-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MANAGER')
  setAvailableHours(@CurrentUser() user: User, @Body() body: { hours: any[] }) {
    return this.managersService.setAvailableHours(user.id, body.hours)
  }
}
