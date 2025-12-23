import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executa uma tarefa agendada (Cron Job) para limpar reservas de estoque expiradas.
   * O 'porquê': No fluxo de compra, um usuário pode reservar itens no carrinho mas abandonar
   * a compra. Este 'cron job' é um mecanismo de auto-correção do sistema. Ele
   * identifica e marca essas reservas como 'EXPIRED', liberando o estoque de volta para
   * venda e garantindo que o inventário disponível esteja sempre correto, prevenindo
   * a perda de vendas por estoque falsamente indisponível.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredStockReservations() {
    this.logger.log('Executando limpeza de reservas de estoque expiradas...');
    try {
      const now = new Date();

      const expiredReservations = await this.prisma.stockReservation.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: {
            lt: now,
          },
        },
        select: {
          id: true,
        },
      });

      if (expiredReservations.length === 0) {
        this.logger.log('Nenhuma reserva expirada encontrada.');
        return;
      }

      const idsToExpire = expiredReservations.map((res) => res.id);

      const { count } = await this.prisma.stockReservation.updateMany({
        where: {
          id: {
            in: idsToExpire,
          },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      this.logger.log(
        `${count} reservas de estoque foram marcadas como expiradas.`,
      );
    } catch (error) {
      // Adiciona logging de erro estruturado para garantir a observabilidade.
      this.logger.error('Falha ao processar reservas de estoque expiradas.', {
        errorMessage: error.message,
        stack: error.stack,
      });
    }
  }
}
