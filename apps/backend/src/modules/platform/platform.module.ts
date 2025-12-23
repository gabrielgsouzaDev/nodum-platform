/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, Global } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { PlatformController } from './platform.controller';
import { GlobalAdminController } from './global-admin.controller';
import { BillingService } from './billing.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

/**
 * PLATFORM MODULE v3.8.5 - NODUM CONTROL PLANE
 * Centraliza a governança global, métricas e o motor de faturamento (SaaS).
 */
@Module({
  imports: [PrismaModule, AuthModule, AuditModule],
  controllers: [
    PlatformController, // Gestão de Verticais (AMBRA, etc)
    GlobalAdminController, // Métoras e Dashboard Master
  ],
  providers: [PlatformService, BillingService],
  exports: [PlatformService, BillingService],
})
export class PlatformModule {}
