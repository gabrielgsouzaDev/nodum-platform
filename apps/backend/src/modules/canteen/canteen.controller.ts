import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CanteenService } from './canteen.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/users.decorator';
import { AuthenticatedUserPayload } from '../auth/dto/user-payload.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('Canteen Operations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('canteen')
export class CanteenController {
  constructor(private readonly canteenService: CanteenService) {}

  @Get('order/scan/:hash')
  @Roles(UserRole.CANTEEN_OPERATOR)
  @ApiOperation({
    summary: 'Valida QR Code e busca detalhes do pedido para entrega.',
  })
  @ApiResponse({ status: 200, description: 'Pedido localizado e validado.' })
  @ApiResponse({ status: 404, description: 'QR Code inexistente.' })
  async getOrderByHash(
    @Param('hash') hash: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.canteenService.getOrderByHashForScan(hash, user.canteenId);
  }

  @Get('orders')
  @Roles(UserRole.CANTEEN_OPERATOR, UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Lista a fila de pedidos da cantina (Padrão: PAID).',
  })
  async getOrdersByStatus(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Query() query: OrderQueryDto,
  ) {
    return this.canteenService.getOrdersByStatus(user.canteenId, query.status);
  }

  @Post('orders/:orderId/deliver')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.CANTEEN_OPERATOR)
  @UseInterceptors(AuditInterceptor)
  @Audit('DELIVER_ORDER', 'Order')
  @ApiOperation({
    summary: 'Confirma a entrega física, finalizando a reserva de stock.',
  })
  @ApiResponse({
    status: 200,
    description: 'Entrega confirmada e stock atualizado.',
  })
  async deliverOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.canteenService.deliverOrder(orderId, user.canteenId);
  }
}
