/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RechargeDto } from './dto/recharge.dto';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUserPayload } from '../auth/dto/user-payload.dto';
import { UserRole } from '@prisma/client';

/**
 * WALLET SERVICE v3.8.5 - MASTER INDUSTRIAL
 * Sincronizado com o WalletController para resolver erros TS2345 e TS2339.
 */
@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Realiza uma recarga na carteira de um dependente.
   * RESOLVE TS2345: Aceita o objeto 'user' completo enviado pelo Controller.
   */
  async recharge(user: AuthenticatedUserPayload, rechargeDto: RechargeDto) {
    const { dependentId, amount } = rechargeDto;

    return this.prisma.$transaction(
      async (tx) => {
        // 1. Validação de segurança Multi-tenant (Pai -> Filho ou Admin -> Escola)
        await this.validateAccess(tx, user, dependentId);

        // 2. Busca a carteira e atualiza o saldo
        const wallet = await tx.wallet.findUnique({
          where: { userId: dependentId },
        });

        if (!wallet) {
          throw new NotFoundException(
            `Carteira para o dependente ${dependentId} não encontrada.`,
          );
        }

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: amount },
            version: { increment: 1 },
          },
        });

        // 3. Registro do Ledger (Transação Imutável)
        const transaction = await tx.transaction.create({
          data: {
            walletId: wallet.id,
            amount: amount,
            runningBalance: updatedWallet.balance,
            type: 'RECHARGE',
            status: 'COMPLETED',
            description: `Recarga efetuada via portal (ID: ${user.id})`,
          },
        });

        // 4. Log de Auditoria
        await this.auditService.logAction(tx, {
          userId: user.id,
          action: 'WALLET_RECHARGE',
          entity: 'Wallet',
          entityId: wallet.id,
          meta: { amount, dependentId, transactionId: transaction.id },
        });

        return {
          message: 'Recarga efetuada com sucesso.',
          newBalance: updatedWallet.balance,
        };
      },
      { isolationLevel: 'Serializable' },
    );
  }

  /**
   * SAFETY SWITCH (Alterna o estado de bloqueio)
   * RESOLVE TS2339: Unifica as funções lock/unlock conforme esperado pelo Controller.
   */
  async toggleLock(
    user: AuthenticatedUserPayload,
    dependentId: string,
    isLocked: boolean,
  ) {
    const auditAction = isLocked ? 'WALLET_LOCKED' : 'WALLET_UNLOCKED';
    // O status canPurchaseAlone é o inverso do bloqueio (isLocked)
    const canPurchase = !isLocked;

    return this.prisma.$transaction(
      async (tx) => {
        // 1. Validação de vínculo parental ou administrativo
        const dependent = await tx.user.findFirst({
          where: { id: dependentId },
          select: {
            id: true,
            wallet: { select: { id: true } },
            guardians: { where: { id: user.id } },
          },
        });

        if (!dependent) throw new NotFoundException('Aluno não encontrado.');

        // Validação de acesso (Admins ou Responsável vinculado)
        const isAdmin =
          user.role === UserRole.SCHOOL_ADMIN ||
          user.role === UserRole.GLOBAL_ADMIN;
        const isLinkedGuardian = dependent.guardians.length > 0;

        if (!isAdmin && !isLinkedGuardian) {
          throw new ForbiddenException(
            'Acesso negado. Este aluno não está vinculado a você.',
          );
        }

        if (!dependent.wallet) {
          throw new NotFoundException(
            'Carteira para o dependente não encontrada.',
          );
        }

        // 2. Atualiza o status da carteira
        await tx.wallet.update({
          where: { id: dependent.wallet.id },
          data: { canPurchaseAlone: canPurchase },
        });

        // 3. Auditoria
        await this.auditService.logAction(tx, {
          userId: user.id,
          action: auditAction,
          entity: 'Wallet',
          entityId: dependent.wallet.id,
          meta: { dependentId },
        });

        return {
          message: `Carteira ${canPurchase ? 'desbloqueada' : 'bloqueada'} com sucesso.`,
        };
      },
      { isolationLevel: 'Serializable' },
    );
  }

  /**
   * Método privado para validar o acesso Multi-tenant em transações.
   */
  private async validateAccess(
    tx: any,
    user: AuthenticatedUserPayload,
    dependentId: string,
  ) {
    // 1. Administradores têm passe livre (dentro da escola via RLS)
    if (
      user.role === UserRole.SCHOOL_ADMIN ||
      user.role === UserRole.GLOBAL_ADMIN
    )
      return;

    // 2. Responsáveis precisam de vínculo explícito
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isLinked = await tx.user.findFirst({
      where: {
        id: dependentId,
        guardians: { some: { id: user.id } },
      },
    });

    if (!isLinked) {
      throw new ForbiddenException(
        'Acesso negado. Este aluno não é seu dependente.',
      );
    }
  }
}
