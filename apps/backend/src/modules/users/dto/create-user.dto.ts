import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

// Define o tipo UserRole para garantir a consistência
type UserRole = 'SCHOOL_ADMIN' | 'CANTEEN_OPERATOR' | 'GUARDIAN' | 'STUDENT';
const validRoles: UserRole[] = [
  'SCHOOL_ADMIN',
  'CANTEEN_OPERATOR',
  'GUARDIAN',
  'STUDENT',
];

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria da Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email único do usuário',
    example: 'maria.silva@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 8 caracteres)',
    example: 'Password123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Perfil de acesso do usuário',
    enum: validRoles,
    example: 'GUARDIAN',
  })
  @IsEnum(validRoles)
  role: UserRole;

  @ApiProperty({
    description: 'ID da cantina (obrigatório se for CANTEEN_OPERATOR)',
    required: false,
  })
  @IsString()
  @IsOptional()
  canteenId?: string;
}
