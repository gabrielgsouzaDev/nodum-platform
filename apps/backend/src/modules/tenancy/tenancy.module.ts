import { Module } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { TenancyController } from './tenancy.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

/**
 * TENANCY MODULE v3.8.1 - MASTER INDUSTRIAL
 * Este módulo gerencia o isolamento de inquilinos (escolas) no ecossistema SaaS.
 * * FIX v3.8.1: Adicionado AuditModule nos imports.
 * O 'porquê': O TenancyController utiliza o AuditInterceptor, que por sua vez
 * depende do AuditService. Sem importar o AuditModule aqui, o NestJS não consegue
 * resolver essa dependência no contexto isolado deste módulo.
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuditModule, // Essencial para o funcionamento do AuditInterceptor no Controller
  ],
  controllers: [TenancyController],
  providers: [TenancyService],
  exports: [TenancyService],
})
export class TenancyModule {}
