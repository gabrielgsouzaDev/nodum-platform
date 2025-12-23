import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsGateway } from './notifications.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

/**
 * NOTIFICATIONS MODULE v3.8.1
 * Responsável por alertas e atualizações em tempo real (WebSockets).
 * * Ajuste: Removido NotificationsService (pendente de criação) para sanar erro de importação.
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    // Registramos o JwtModule localmente para que o WsJwtGuard
    // consiga validar os tokens de conexão dos Sockets.
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-cantapp',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
