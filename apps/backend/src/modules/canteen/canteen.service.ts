import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockService } from '../stock/stock.service';

type OrderStatus = 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELLED';

@Injectable()
export class CanteenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockService: StockService,
  ) {}

  async getOrderByHashForScan(orderHash: string, canteenId: string | null) {
    if (!canteenId) {
      throw new ForbiddenException(
        'Acesso negado. Operador não está associado a uma cantina.',
      );
    }

    const order = await this.prisma.order.findUnique({
      where: { orderHash },
      select: {
        id: true,
        status: true,
        student: { select: { name: true } },
        items: {
          select: {
            quantity: true,
            product: { select: { name: true, canteenId: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('QR Code inválido. Pedido não encontrado.');
    }

    const firstItem = order.items[0];
    if (!firstItem || firstItem.product.canteenId !== canteenId) {
      throw new ForbiddenException('Este pedido não pertence à sua cantina.');
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new ConflictException(
        `Este pedido já foi ${order.status === 'DELIVERED' ? 'entregue' : 'cancelado'}.`,
      );
    }

    if (order.status !== 'PAID') {
      throw new BadRequestException(
        'Este pedido ainda não foi pago e não pode ser entregue.',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...displayOrder } = order;
    return displayOrder;
  }

  async getOrdersByStatus(
    canteenId: string | null,
    status: OrderStatus = 'PAID',
  ) {
    if (!canteenId) {
      throw new ForbiddenException(
        'Acesso negado. Operador não está associado a uma cantina.',
      );
    }

    return this.prisma.order.findMany({
      where: {
        status: status, // Filtra pelo status fornecido
        items: {
          some: {
            product: {
              canteenId: canteenId,
            },
          },
        },
      },
      select: {
        id: true,
        orderHash: true,
        createdAt: true,
        totalAmount: true,
        student: {
          select: { name: true },
        },
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async deliverOrder(orderId: string, canteenId: string | null) {
    if (!canteenId) {
      throw new ForbiddenException(
        'Acesso negado. Operador não está associado a uma cantina.',
      );
    }

    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            status: 'PAID',
            items: { some: { product: { canteenId: canteenId } } },
          },
        });

        if (!order) {
          throw new NotFoundException(
            'Pedido não encontrado, já entregue ou não pertence à sua cantina.',
          );
        }

        await this.stockService.finalizeOrderDeliveryInTransaction(
          tx,
          orderId,
          canteenId,
        );

        const deliveredOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'DELIVERED',
            deliveredAt: new Date(),
          },
        });

        return deliveredOrder;
      },
      {
        isolationLevel: 'Serializable',
      },
    );
  }
}
