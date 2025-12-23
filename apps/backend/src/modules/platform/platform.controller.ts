/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PlatformService } from './platform.service';
import { CreateSystemDto } from './dto/create-system.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Platform (Global Admin Only)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('platform')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Post('systems')
  @Roles(UserRole.GLOBAL_ADMIN)
  @ApiOperation({
    summary: 'Cadastra uma nova vertical de negócio (Ex: AMBRA)',
  })
  async create(@Body() dto: CreateSystemDto) {
    return this.platformService.createSystem(dto);
  }

  @Get('systems')
  @Roles(UserRole.GLOBAL_ADMIN)
  @ApiOperation({ summary: 'Lista todos os sistemas afiliados na plataforma' })
  async findAll() {
    return this.platformService.findAllSystems();
  }
}
