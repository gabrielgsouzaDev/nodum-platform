
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionService } from '../transactions/transactions.service';
import { StockService } from '../stock/stock.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { randomBytes } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { OrderStatus, Prisma, Product } from '@prisma/client';

/**
 * ORDERS SERVICE v3.8.5 - MASTER INDUSTRIAL (RIZO & AMBRA)
 * Orquestra o checkout atômico integrando Finanças, Estoque e Controle Parental.
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
    private readonly stockService: StockService,
    private readonly auditService: AuditService,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  /**
   * Processamento de Pedido com Isolamento 'Serializable'
   * Garante integridade absoluta entre saldo, estoque e restrições.
   */
  async create(buyerId: string, createOrderDto: CreateOrderDto) {
    const { studentId, items } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('O pedido deve conter pelo menos um item.');
    }

    // A transação Serializable impede "Double Spending" e erros de estoque concorrente.
    const paidOrder = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // ETAPA 1: Busca e Validação de Produtos
        const productIds = items.map((item) => item.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, deletedAt: null },
        });

        if (products.length !== productIds.length) {
          throw new NotFoundException(
            'Um ou mais produtos não foram encontrados ou foram removidos.',
          );
        }

        // ETAPA 1.5: Verificação de Restrições Parentais (RIZO FOOD)
        await this.checkRestrictions(tx, studentId, items, products);

        // ETAPA 1.6: Verificação de Segurança (Safety Switch) e Dias Permitidos
        const wallet = await tx.wallet.findUnique({
          where: { userId: studentId },
          include: { user: { select: { schoolId: true } } },
        });

        if (!wallet || !wallet.user) {
          throw new NotFoundException(
            `Carteira ou vínculo institucional do beneficiário não localizado.`,
          );
        }

        // Trava de Bloqueio Manual
        if (!wallet.canPurchaseAlone && buyerId === studentId) {
          throw new ForbiddenException(
            'Compra negada: Sua carteira está bloqueada para compras autônomas.',
          );
        }

        // Trava de Dias da Semana (Allowed Days)
        const dayOfWeek = new Date().getDay();
        if (!wallet.allowedDays.includes(dayOfWeek)) {
          throw new BadRequestException(
            'A compra não é permitida para este aluno no dia de hoje.',
          );
        }

        // ETAPA 1.7: Consistência de Unidade e Cálculo de Valor
        const firstProduct = products[0];
        if (!firstProduct)
          throw new NotFoundException('Erro na listagem de produtos.');

        const firstCanteenId = firstProduct.canteenId;
        const schoolId = wallet.user.schoolId;

        if (!schoolId) {
          throw new ForbiddenException(
            'O aluno não possui uma escola vinculada.',
          );
        }

        let totalAmount = 0;

        for (const item of items) {
          const product = products.find((p) => p.id === item.productId);

          // FIX: Tratamento explicativo para o TypeScript (possibly undefined)
          if (!product) {
            throw new NotFoundException(
              `Produto ${item.productId} não encontrado na base de dados.`,
            );
          }

          if (!product.isAvailable) {
            throw new BadRequestException(
              `O item "${product.name}" não está disponível no cardápio.`,
            );
          }
          if (product.canteenId !== firstCanteenId) {
            throw new BadRequestException(
              'Não é permitido misturar itens de cantinas diferentes no mesmo pedido.',
            );
          }

          const price = product.salePrice ?? product.price;
          totalAmount += Number(price) * item.quantity;
        }

        // ETAPA 2: Reserva de Estoque
        await this.stockService.reserveProductsInTransaction(
          tx,
          items,
          firstCanteenId,
        );

        // ETAPA 3: Criação do Pedido (Status: PENDING)
        const orderHash = `AMBRA-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
        const order = await tx.order.create({
          data: {
            buyerId,
            studentId,
            totalAmount,
            status: OrderStatus.PENDING,
            orderHash,
            schoolId: schoolId, // FIX: Garantido pela validação na Etapa 1.7
            items: {
              create: items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product)
                  throw new NotFoundException(
                    `Falha de integridade no item ${item.productId}`,
                  );

                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: product.salePrice ?? product.price,
                };
              }),
            },
          },
        });

        // ETAPA 4: Débito Financeiro
        await this.transactionService.debitFromWalletForOrderInTransaction(tx, {
          buyerId,
          studentId,
          totalAmount,
          orderId: order.id,
        });

        // ETAPA 5: Finalização e Confirmação de Reserva
        const finalPaidOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAID },
          include: {
            items: { include: { product: true } },
            student: { select: { name: true } },
          },
        });

        await tx.stockReservation.updateMany({
          where: { productId: { in: productIds }, status: 'ACTIVE' },
          data: { status: 'COMPLETED' },
        });

        // ETAPA 6: Auditoria Industrial
        await this.auditService.logAction(tx, {
          userId: buyerId,
          action: 'ORDER_PROCESS_COMPLETED',
          entity: 'Order',
          entityId: finalPaidOrder.id,
          meta: { totalAmount, orderHash: finalPaidOrder.orderHash },
        });

        return finalPaidOrder;
      },
      { isolationLevel: 'Serializable', timeout: 15000 },
    );

    // ETAPA 7: Notificação em Tempo Real
    try {
      this.notificationsGateway.notifyNewOrder(paidOrder.schoolId, paidOrder);
    } catch (error: any) {
      this.logger.error(
        `WebSocket Fail: Pedido ${paidOrder.id} processado, mas notificação falhou.`,
        error.stack || error,
      );
    }

    return paidOrder;
  }

  /**
   * Validação de Restrições Parentais (Camada Food Domain)
   */
  private async checkRestrictions(
    tx: Prisma.TransactionClient,
    studentId: string,
    items: OrderItemDto[],
    products: Product[],
  ) {
    const [prodRest, catRest] = await Promise.all([
      tx.productRestriction.findMany({ where: { userId: studentId } }),
      tx.categoryRestriction.findMany({ where: { userId: studentId } }),
    ]);

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      // FIX: Tratamento para o TypeScript garantir que o produto existe antes de checar propriedades
      if (!product) {
        throw new NotFoundException(
          `Produto ${item.productId} não identificado para validação de restrições.`,
        );
      }

      if (prodRest.some((r) => r.productId === product.id)) {
        throw new ForbiddenException(
          `Bloqueio Parental: O consumo de "${product.name}" não é permitido.`,
        );
      }

      if (catRest.some((r) => r.category === product.category)) {
        throw new ForbiddenException(
          `Bloqueio Parental: A categoria "${product.category}" está restrita para este aluno.`,
        );
      }
    }
  }
}
