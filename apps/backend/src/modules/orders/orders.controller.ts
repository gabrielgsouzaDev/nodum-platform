import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/users.decorator';
import { AuthenticatedUserPayload } from '../auth/dto/user-payload.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ summary: 'Cria um novo pedido para um aluno' })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado e pago com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou saldo insuficiente.',
  })
  @ApiResponse({
    status: 403,
    description: 'Produto bloqueado pelas restrições parentais.',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto ou carteira não encontrado.',
  })
  async create(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    // O buyerId é extraído do token do usuário autenticado (o responsável).
    const buyerId = user.id;
    return this.ordersService.create(buyerId, createOrderDto);
  }
}
