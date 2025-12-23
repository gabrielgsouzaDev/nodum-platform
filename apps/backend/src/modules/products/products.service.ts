import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    createProductDto: CreateProductDto,
    schoolId: string,
    canteenId: string,
  ) {
    const canteen = await this.prisma.canteen.findFirst({
      where: { id: canteenId, schoolId: schoolId },
    });

    if (!canteen) {
      throw new ForbiddenException(
        'A cantina especificada não pertence a esta escola.',
      );
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        canteenId,
        schoolId,
      },
    });
  }

  findAll(canteenId?: string | null) {
    const where: any = { deletedAt: null };

    if (canteenId) {
      where.canteenId = canteenId;
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { version, ...dataToUpdate } = updateProductDto;

    return this.prisma.$transaction(
      async (tx) => {
        const product = await tx.product.findUnique({
          where: { id },
        });

        if (!product) {
          throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
        }

        if (product.version !== version) {
          throw new ConflictException(
            'Este produto foi modificado por outro usuário. Por favor, atualize a página.',
          );
        }

        return tx.product.update({
          where: { id },
          data: {
            ...dataToUpdate,
            version: { increment: 1 },
          },
        });
      },
      { isolationLevel: 'Serializable' },
    );
  }

  /**
   * AJUSTE DE ESTOQUE v3.8.3 - INDUSTRIAL
   * Resolve o erro: Property 'updateStock' does not exist.
   */
  async updateStock(id: string, change: number) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Produto não encontrado.');

      const updated = await tx.product.update({
        where: { id },
        data: {
          stock: { increment: change },
          version: { increment: 1 },
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId: id,
          canteenId: product.canteenId,
          change,
          reason: 'Ajuste manual via Painel Administrativo',
        },
      });

      return updated;
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
