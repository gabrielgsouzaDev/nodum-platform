import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * METRICS SERVICE v1.0.0
 * Coleta métricas operacionais do sistema para dashboard e monitoramento.
 *
 * Métricas coletadas:
 * - Pedidos (última hora, dia, semana)
 * - Receita (última hora, dia, semana)
 * - Usuários ativos (24h)
 * - Produtos com estoque baixo
 * - Performance do sistema (memória, CPU)
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      ordersLastHour,
      ordersLastDay,
      ordersLastWeek,
      revenueLastHour,
      revenueLastDay,
      revenueLastWeek,
      activeUsers24h,
      lowStockProducts,
      totalStudents,
      totalProducts,
    ] = await Promise.all([
      // Pedidos última hora
      this.prisma.order.count({
        where: {
          createdAt: { gte: oneHourAgo },
          status: { in: ['PAID', 'DELIVERED'] },
        },
      }),

      // Pedidos último dia
      this.prisma.order.count({
        where: {
          createdAt: { gte: oneDayAgo },
          status: { in: ['PAID', 'DELIVERED'] },
        },
      }),

      // Pedidos última semana
      this.prisma.order.count({
        where: {
          createdAt: { gte: oneWeekAgo },
          status: { in: ['PAID', 'DELIVERED'] },
        },
      }),

      // Receita última hora
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: oneHourAgo },
          status: { in: ['PAID', 'DELIVERED'] },
        },
        _sum: { totalAmount: true },
      }),

      // Receita último dia
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: oneDayAgo },
          status: { in: ['PAID', 'DELIVERED'] },
        },
        _sum: { totalAmount: true },
      }),

      // Receita última semana
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: oneWeekAgo },
          status: { in: ['PAID', 'DELIVERED'] },
        },
        _sum: { totalAmount: true },
      }),

      // Usuários ativos (login nas últimas 24h)
      this.prisma.user.count({
        where: {
          lastLoginAt: { gte: oneDayAgo },
          deletedAt: null,
        },
      }),

      // Produtos com estoque baixo
      this.prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM products
        WHERE stock <= "minStockAlert"
        AND "deletedAt" IS NULL
      `.then((result) => Number(result[0]?.count || 0)),

      // Total de estudantes
      this.prisma.user.count({
        where: {
          role: 'STUDENT',
          deletedAt: null,
        },
      }),

      // Total de produtos
      this.prisma.product.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    const memoryUsage = process.memoryUsage();

    return {
      timestamp: now.toISOString(),
      orders: {
        lastHour: ordersLastHour,
        lastDay: ordersLastDay,
        lastWeek: ordersLastWeek,
      },
      revenue: {
        lastHour: Number(revenueLastHour._sum.totalAmount || 0),
        lastDay: Number(revenueLastDay._sum.totalAmount || 0),
        lastWeek: Number(revenueLastWeek._sum.totalAmount || 0),
      },
      users: {
        active24h: activeUsers24h,
        totalStudents,
      },
      inventory: {
        lowStock: lowStockProducts,
        totalProducts,
      },
      system: {
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        uptime: Math.round(process.uptime()), // segundos
      },
    };
  }

  async getRevenueMetrics(days: number = 7) {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Receita por dia
    const revenueByDay = await this.prisma.$queryRaw<
      Array<{
        date: Date;
        total: number;
      }>
    >`
      SELECT 
        DATE("createdAt") as date,
        SUM("totalAmount")::numeric as total
      FROM orders
      WHERE "createdAt" >= ${startDate}
      AND status IN ('PAID', 'DELIVERED')
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return {
      period: `${days} days`,
      data: revenueByDay.map((item) => ({
        date: item.date,
        total: Number(item.total),
      })),
    };
  }

  async getTopProducts(limit: number = 10) {
    const topProducts = await this.prisma.$queryRaw<
      Array<{
        product_id: string;
        product_name: string;
        total_quantity: bigint;
        total_revenue: number;
      }>
    >`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity)::bigint as total_quantity,
        SUM(oi.quantity * oi."unitPrice")::numeric as total_revenue
      FROM order_items oi
      JOIN products p ON p.id = oi."productId"
      JOIN orders o ON o.id = oi."orderId"
      WHERE o.status IN ('PAID', 'DELIVERED')
      AND o."createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT ${limit}
    `;

    return topProducts.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      totalQuantity: Number(item.total_quantity),
      totalRevenue: Number(item.total_revenue),
    }));
  }
}
