import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/users.decorator';
import { AuthenticatedUserPayload } from '../auth/dto/user-payload.dto';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { Audit } from '../../common/decorators/audit.decorator';

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Audit('CREATE_USER', 'User')
  @ApiOperation({
    summary: 'Cria um novo utilizador na escola (Aluno, Operador ou Admin).',
  })
  @ApiResponse({ status: 201, description: 'Utilizador criado com sucesso.' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    // Garantimos que o utilizador só cria membros para a sua própria escola
    return this.usersService.create(createUserDto, user.schoolId!);
  }

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({
    summary: 'Lista todos os utilizadores da escola (Isolamento RLS ativo).',
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Busca um utilizador específico por ID.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Audit('UPDATE_USER', 'User')
  @ApiOperation({ summary: 'Atualiza dados de um utilizador.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Audit('DELETE_USER', 'User')
  @ApiOperation({
    summary: 'Remove um utilizador (Soft Delete para integridade financeira).',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Post('invitations')
  @Roles(UserRole.GUARDIAN)
  @UseInterceptors(AuditInterceptor)
  @Audit('SEND_INVITATION', 'GuardianInvitation')
  @ApiOperation({
    summary: 'Envia convite para outro responsável (Fluxo Parental).',
  })
  async sendInvite(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body('email') email: string,
  ) {
    return this.usersService.inviteGuardian(user.id, email);
  }
}
