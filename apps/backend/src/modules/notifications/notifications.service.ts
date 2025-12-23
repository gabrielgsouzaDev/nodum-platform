/* eslint-disable @typescript-eslint/require-await */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

/**
 * RIZO CORE - NOTIFICATION ENGINE v3.8.4
 * Centraliza o envio de alertas (Push, WS e futuramente WhatsApp/Email).
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: NotificationsGateway,
  ) {}

  /**
   * Envia uma notificação de compra em tempo real para o responsável.
   */
  async notifyPurchase(studentId: string, amount: number, productName: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { guardians: { select: { id: true, email: true } } },
    });

    if (!student) return;

    const message = `Consumo: ${student.name} acabou de comprar ${productName} (R$ ${amount.toFixed(2)}).`;

    // 1. Envio via WebSocket (Para quem está com o App aberto)
    for (const guardian of student.guardians) {
      this.wsGateway.sendToUser(guardian.id, 'notification', {
        type: 'PURCHASE',
        title: 'Novo Consumo',
        message,
        timestamp: new Date(),
      });
    }

    // 2. Log para Auditoria
    this.logger.log(
      `Notificação enviada para os responsáveis de ${student.name}`,
    );

    // TODO: Integrar com Firebase Cloud Messaging (FCM) ou WhatsApp API aqui.
  }

  /**
   * Alerta de saldo baixo.
   */
  async notifyLowBalance(userId: string, currentBalance: number) {
    if (currentBalance < 10.0) {
      this.wsGateway.sendToUser(userId, 'notification', {
        type: 'LOW_BALANCE',
        title: 'Saldo Baixo',
        message: `Atenção: O saldo da carteira está em R$ ${currentBalance.toFixed(2)}. Considere recarregar.`,
      });
    }
  }
}
