import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

// Módulos de Infraestrutura (Core)
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { HealthModule } from './modules/health/health.module';
import { AuditModule } from './modules/audit/audit.module';
import { MetricsModule } from './modules/metrics/metrics.module';

// Módulos de Domínio e Gestão (Business)
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';
import { PlatformModule } from './modules/platform/platform.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StockModule } from './modules/stock/stock.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CanteenModule } from './modules/canteen/canteen.module';
import { GuardianModule } from './modules/guardian/guardian.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SchoolAdminModule } from './modules/school-admin/school-admin.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AiModule } from './modules/ai/ai.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CommunicationModule } from './modules/communication/communication.module';
import { StorageModule } from './modules/storage/storage.module';
import { ImportModule } from './modules/import/import.module';

// Middleware e Segurança
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { SubscriptionGuard } from './common/guards/subscription.guard';
import { TenantThrottlerGuard } from './common/guards/tenant-throttler.guard';

/**
 * APP MODULE v3.8.22 - NODUM KERNEL MASTER
 * Centralizador de soberania. Esta versão garante o carregamento prioritário de segredos.
 */
@Module({
  imports: [
    // 1. PRIORIDADE ZERO: Configurações e Segredos
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),

    // 2. Motores de Base (Async/Event/Task)
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // 3. Infraestrutura Core
    PrismaModule,
    CacheModule, // Redis Master (Serviço Resiliente Customizado)
    NestCacheModule.register({ isGlobal: true, ttl: 60000 }), // In-Memory Cache (Interceptors Padrão)
    HealthModule,
    AuditModule,
    MetricsModule,

    // 4. Domínio Industrial
    AuthModule,
    UsersModule,
    TenancyModule,
    PlatformModule,
    InvitationsModule,
    ProductsModule,
    OrdersModule,
    StockModule,
    TransactionsModule,
    CanteenModule,
    GuardianModule,
    WalletModule,
    SchoolAdminModule,
    PaymentModule,
    AiModule,
    TasksModule,
    NotificationsModule,
    CommunicationModule,
    StorageModule,
    ImportModule,
  ],
  providers: [
    // Governança de Tráfego por Tenant
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },
    // Governança de Assinatura (SaaS)
    {
      provide: APP_GUARD,
      useClass: SubscriptionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configuração de Middlewares Globais.
   * Injeta o contexto da escola (Tenant) em todas as requisições.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware, TenantMiddleware).forRoutes('*');
  }
}
