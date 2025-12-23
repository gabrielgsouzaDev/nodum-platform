import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { TenancyService } from './tenancy.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

/**
 * TENANCY CONTROLLER v3.8.1 - MASTER INDUSTRIAL
 * Este controller é a "Central de Comando" do SaaS.
 * Apenas o Global Admin tem permissão para acessar estas rotas.
 */
@ApiTags('Tenancy (Global Management)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('tenancy')
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Post('schools')
  @Roles(UserRole.GLOBAL_ADMIN) // Proteção nível 101% - Apenas o Super User
  @ApiOperation({
    summary: 'Inaugura uma nova escola no SaaS.',
    description:
      'Cria o Tenant isolado, o Administrador da escola e vincula a carteira financeira inicial.',
  })
  @ApiResponse({
    status: 201,
    description: 'Escola e gestor criados com sucesso em transação atômica.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito: CNPJ ou Slug já em uso.',
  })
  async create(@Body() dto: CreateSchoolDto) {
    return this.tenancyService.createSchoolWithAdmin(dto);
  }

  @Get('schools')
  @Roles(UserRole.GLOBAL_ADMIN)
  @ApiOperation({
    summary: 'Lista todas as instituições do ecossistema.',
    description: 'Visão geral para faturamento e gestão do SaaS.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de escolas com contagem de usuários e planos.',
  })
  async findAll() {
    return this.tenancyService.listAllSchools();
  }
}
