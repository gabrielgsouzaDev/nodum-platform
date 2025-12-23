import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Global Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('global-admin')
export class GlobalAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('metrics')
  @Roles(UserRole.GLOBAL_ADMIN)
  @ApiOperation({
    summary: 'Métricas de saúde e faturamento do ecossistema RIZO.',
  })
  async getStats() {
    const [schools, students, revenue] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.user.count({ where: { role: UserRole.STUDENT } }),
      this.prisma.transaction.aggregate({
        where: { type: 'RECHARGE', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return {
      activeTenants: schools,
      totalStudents: students,
      processedVolume: revenue._sum.amount || 0,
      platformStatus: 'OPERATIONAL',
    };
  }
}
