import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

/**
 * TRANSACTION SERVICE v3.8.3 - MASTER INDUSTRIAL
 * O motor financeiro do CantApp. Gere o Ledger (Livro-razão) imutável.
 */
type PrismaTransactionalClient = Prisma.TransactionClient;

interface DebitForOrderData {
  buyerId: string;
  studentId: string;
  totalAmount: number;
  orderId?: string; // FIX: Tornado opcional para permitir compras avulsas sem pedido imediato
}

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * RECARGA DE CARTEIRA (ENTRADA DE FUNDOS)
   * Resolve o erro: Property 'processRecharge' does not exist.
   * O 'porquê': Utiliza isolamento Serializable para garantir que o saldo seja
   * incrementado de forma atómica, protegendo contra condições de corrida.
   */
  async processRecharge(userId: string, amount: number, externalId?: string) {
    return this.prisma.$transaction(
      async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new NotFoundException(
            'Carteira não encontrada para este utilizador.',
          );
        }

        const currentBalance = Number(wallet.balance);
        const newBalance = currentBalance + amount;

        // 1. Registo no Ledger (Transaction)
        const transaction = await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: amount,
            runningBalance: newBalance,
            type: 'RECHARGE',
            status: 'COMPLETED',
            description: 'Recarga de Saldo - PIX/Cartão',
            externalId,
          },
        });

        // 2. Atualização do Saldo Real com Optimistic Locking
        await tx.wallet.update({
          where: { id: wallet.id, version: wallet.version },
          data: {
            balance: newBalance,
            version: { increment: 1 },
          },
        });

        return { transactionId: transaction.id, newBalance };
      },
      { isolationLevel: 'Serializable' },
    );
  }

  /**
   * PROCESSO DE COMPRA (DÉBITO DIRETO)
   * Versão standalone para compras rápidas ou ajustes.
   */
  async processPurchase(
    buyerId: string,
    studentId: string,
    totalAmount: number,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        return this.debitFromWalletForOrderInTransaction(tx, {
          buyerId,
          studentId,
          totalAmount,
          orderId: undefined, // Compra avulsa sem ID de pedido imediato
        });
      },
      { isolationLevel: 'Serializable' },
    );
  }

  /**
   * DÉBITO PARA PEDIDOS (DENTRO DE TRANSAÇÃO EXTERNA)
   * Mantido para coerência com o fluxo de checkout de pedidos.
   */
  async debitFromWalletForOrderInTransaction(
    tx: PrismaTransactionalClient,
    data: DebitForOrderData,
  ) {
    const { buyerId, studentId, totalAmount, orderId } = data;

    const wallet = await tx.wallet.findUnique({
      where: { userId: buyerId },
    });

    if (!wallet) {
      throw new NotFoundException(
        'Carteira não encontrada para este comprador.',
      );
    }

    const currentBalance = Number(wallet.balance);
    if (currentBalance < totalAmount) {
      throw new BadRequestException('Saldo insuficiente na carteira.');
    }

    // Validação de Limite Diário
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dailySpend = await tx.dailySpend.findUnique({
      where: {
        walletId_date: { walletId: wallet.id, date: today },
      },
    });

    const spentToday = dailySpend ? Number(dailySpend.amount) : 0;
    const dailyLimit = Number(wallet.dailySpendLimit);

    if (dailyLimit > 0 && spentToday + totalAmount > dailyLimit) {
      throw new BadRequestException('Limite diário de gastos excedido.');
    }

    const newBalance = currentBalance - totalAmount;

    // Atualização de Gasto Diário
    await tx.dailySpend.upsert({
      where: { walletId_date: { walletId: wallet.id, date: today } },
      update: { amount: { increment: totalAmount } },
      create: { walletId: wallet.id, date: today, amount: totalAmount },
    });

    // Atualização da Carteira
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id, version: wallet.version },
      data: {
        balance: newBalance,
        version: { increment: 1 },
      },
    });

    if (!updatedWallet) {
      throw new InternalServerErrorException(
        'Falha de concorrência financeira.',
      );
    }

    // Registo do Ledger
    const transaction = await tx.transaction.create({
      data: {
        walletId: wallet.id,
        orderId: orderId, // Aceita string ou undefined
        amount: -totalAmount,
        runningBalance: newBalance,
        type: 'PURCHASE',
        status: 'COMPLETED',
        description: `Compra CantApp para beneficiário ${studentId}`,
      },
    });

    return {
      transactionId: transaction.id,
      newBalance: updatedWallet.balance,
      status: 'SUCCESS',
    };
  }
}
