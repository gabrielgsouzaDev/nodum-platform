import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Injectable()
export class SchoolAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const revenueResult = await this.prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: { in: ['PAID', 'DELIVERED'] },
      },
    });

    const ordersCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const allProductsInSchool = await this.prisma.product.findMany({
      where: { isAvailable: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        stock: true,
        minStockAlert: true,
      },
    });

    const lowStockProducts = allProductsInSchool.filter(
      (p) => p.stock <= p.minStockAlert,
    );

    return {
      todayRevenue: revenueResult._sum.totalAmount || 0,
      todayOrders: ordersCount,
      lowStockAlerts: lowStockProducts,
    };
  }

  async updateSchoolConfig(schoolId: string, updateConfigDto: UpdateConfigDto) {
    return this.prisma.$transaction(async (tx) => {
      const school = await tx.school.findUnique({
        where: { id: schoolId },
        include: { plan: true },
      });

      if (!school) throw new NotFoundException('Escola não encontrada.');

      // Trava comercial baseada no plano
      if (updateConfigDto.customDomain && school.plan.name !== 'Enterprise') {
        throw new ForbiddenException(
          'Domínios customizados estão disponíveis apenas no plano Enterprise.',
        );
      }

      const currentConfig =
        school.config && typeof school.config === 'object' ? school.config : {};
      const newConfig = { ...currentConfig, ...updateConfigDto.theme };

      return tx.school.update({
        where: { id: schoolId },
        data: {
          customDomain: updateConfigDto.customDomain,
          config: newConfig,
        },
      });
    });
  }
}
