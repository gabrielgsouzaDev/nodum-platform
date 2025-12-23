/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UserRole, SchoolStatus, Prisma, PlanStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * TENANCY SERVICE v3.8.5 - NODUM KERNEL MASTER
 * Gerencia a infraestrutura multi-multi-tenant.
 * Cada Unidade (Escola) é vinculada a um Sistema (Affiliate) e a um Plano.
 */
@Injectable()
export class TenancyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inauguração Atômica de Unidade Escolar.
   * O 'porquê': Nível de isolamento 'Serializable' garante que não existam colisões
   * de Slug ou CNPJ mesmo sob altíssima concorrência de criação de tenants.
   */
  async createSchoolWithAdmin(dto: CreateSchoolDto) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Validar se o Sistema Affiliate (ex: AMBRA) existe e está ativo
        const system = await (tx as any).platformSystem.findUnique({
          where: { id: dto.systemId },
        });
        if (!system || system.status !== 'ACTIVE') {
          throw new NotFoundException(
            'Sistema Affiliate não encontrado ou inativo.',
          );
        }

        // 2. Validar se o plano comercial existe e está ativo
        const plan = await tx.plan.findUnique({
          where: { id: dto.planId },
        });
        if (!plan || plan.status !== PlanStatus.ACTIVE) {
          throw new NotFoundException(
            'Plano comercial não encontrado ou descontinuado.',
          );
        }

        // 3. Verificar duplicidade de CNPJ ou Slug (Identidade da Escola)
        const existing = await tx.school.findFirst({
          where: { OR: [{ taxId: dto.taxId }, { slug: dto.slug }] },
        });
        if (existing) {
          throw new ConflictException(
            'Uma instituição com este CNPJ ou Slug já está cadastrada.',
          );
        }

        // 4. Criar a Unidade (Tenant)
        const school = await tx.school.create({
          data: {
            name: dto.name,
            taxId: dto.taxId,
            slug: dto.slug,
            systemId: system.id,
            planId: plan.id,
            status: SchoolStatus.ACTIVE,
            config: {
              primaryColor: '#FC5407', // Aerospace Orange (AMBRA Default)
              logo: 'https://cdn.nodum.app/ambra-default.png',
            },
          } as any,
        });

        // 5. Registrar Histórico Inicial de Plano (Essencial para Billing)
        await tx.schoolPlanHistory.create({
          data: {
            schoolId: school.id,
            planId: plan.id,
            startedAt: new Date(),
          },
        });

        // 6. Criar o Administrador Mestre da Escola
        const hashedPassword = await bcrypt.hash(dto.adminPassword, 10);
        const admin = await tx.user.create({
          data: {
            name: dto.adminName,
            email: dto.adminEmail,
            passwordHash: hashedPassword,
            role: UserRole.SCHOOL_ADMIN,
            schoolId: school.id,
            wallet: {
              create: {
                balance: 0,
                dailySpendLimit: 0,
                allowedDays: [1, 2, 3, 4, 5], // Padrão segunda a sexta
              },
            },
          },
        });

        return {
          message: 'Unidade industrial inaugurada com sucesso.',
          schoolId: school.id,
          adminId: admin.id,
          system: system.name,
          plan: plan.name,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Listagem para o Console Global (NODUM) filtrada por Sistema.
   */
  async findAllBySystem(systemSlug: string) {
    return this.prisma.school.findMany({
      where: { system: { slug: systemSlug } } as any,
      include: {
        plan: { select: { name: true, price: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listagem de todas as escolas (Visão Gabriel SuperAdmin)
   */
  async listAllSchools() {
    return this.prisma.school.findMany({
      include: {
        system: { select: { name: true, slug: true } },
        plan: { select: { name: true } },
        _count: { select: { users: true } },
      } as any,
    });
  }
}
