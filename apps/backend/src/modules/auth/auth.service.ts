import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
// FIX: Replaced failing imports with local type aliases and string literals for logic.
// import { UserRole, SchoolStatus } from '@prisma/client';
import { UserProfileDto } from './dto/user-payload.dto';

// FIX: Define local type aliases as a workaround for the import issue.
type UserRole =
  | 'GLOBAL_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'CANTEEN_OPERATOR'
  | 'GUARDIAN'
  | 'STUDENT';
type SchoolStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Autentica um usuário com base em suas credenciais.
   * O 'porquê': A lógica vai além da simples verificação de senha. Ela também valida
   * o status da escola (tenant), impedindo que usuários de escolas suspensas ou canceladas
   * acessem o sistema. Isso é uma regra de negócio de segurança crítica para um SaaS multi-tenant.
   * @param loginDto - O DTO contendo email e senha.
   * @returns Um objeto com o token de acesso e um resumo do perfil do usuário.
   * @throws {UnauthorizedException} Se as credenciais forem inválidas.
   * @throws {ForbiddenException} Se a escola do usuário não estiver ativa.
   * @throws {InternalServerErrorException} Se houver um erro na geração do token.
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        school: {
          select: { status: true },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    this.validateTenantAccess(
      user.role as UserRole,
      user.school?.status as SchoolStatus,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    };

    try {
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao gerar token de acesso.');
    }
  }

  /**
   * Obtém um perfil de usuário seguro para exibição no frontend.
   * O 'porquê': Seleciona explicitamente (`select`) apenas os campos não sensíveis,
   * garantindo que informações como hash de senha ou data de exclusão nunca sejam
   * acidentalmente expostas, aderindo ao princípio de "data minimization".
   * @param userId - O ID do usuário extraído do token JWT.
   * @returns Um DTO com os dados públicos do perfil do usuário.
   * @throws {NotFoundException} Se o usuário não for encontrado ou estiver desativado.
   */
  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user as UserProfileDto;
  }

  /**
   * Valida se um usuário (não-global) pode acessar seu tenant.
   * @param role A role do usuário.
   * @param schoolStatus O status da escola associada.
   */
  private validateTenantAccess(role: UserRole, schoolStatus?: SchoolStatus) {
    // FIX: Use string literal for comparison.
    if (role === 'GLOBAL_ADMIN') return;

    // FIX: Use string literal for comparison.
    if (!schoolStatus || schoolStatus !== 'ACTIVE') {
      throw new ForbiddenException(
        'Acesso bloqueado. A unidade escolar não está ativa.',
      );
    }
  }
}
