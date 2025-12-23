import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

class ThemeDto {
  @ApiProperty({ example: '#4A90E2' })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ example: 'https://cdn.example.com/logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class UpdateConfigDto {
  @ApiProperty({
    description:
      'Domínio customizado para a escola (apenas para planos Enterprise).',
    example: 'cantina.minhaescola.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  customDomain?: string;

  @ApiProperty({
    description: 'Configurações de tema para white-labeling.',
    required: false,
  })
  @IsObject()
  @IsOptional()
  theme?: ThemeDto;
}
