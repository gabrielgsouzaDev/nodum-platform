/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSystemDto } from './dto/create-system.dto';

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova vertical de negócio no ecossistema NODUM.
   * Apenas GLOBAL_ADMIN tem acesso (protegido no controller).
   */
  async createSystem(dto: CreateSystemDto) {
    const existing = await (this.prisma as any).platformSystem.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Já existe um sistema com este slug.');
    }

    return (this.prisma as any).platformSystem.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        status: 'ACTIVE',
      },
    });
  }

  async findAllSystems() {
    return (this.prisma as any).platformSystem.findMany({
      include: { _count: { select: { schools: true } } },
    });
  }
}
