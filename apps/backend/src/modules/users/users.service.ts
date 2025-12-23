import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InvitationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, schoolId: string) {
    const { password, ...userData } = createUserDto;

    return this.prisma.$transaction(
      async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { email: userData.email },
        });
        if (existingUser) {
          throw new ConflictException('Um usuário com este email já existe.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await tx.user.create({
          data: {
            ...userData,
            passwordHash: hashedPassword,
            schoolId,
            wallet: userData.role === 'STUDENT' ? { create: {} } : undefined,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...result } = user;
        return result;
      },
      { isolationLevel: 'Serializable' },
    );
  }

  findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: id, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        canteenId: true,
        createdAt: true,
        dependents: { select: { id: true, name: true } },
        guardians: { select: { id: true, name: true } },
      },
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return user;
  }

  /**
   * CONVITE DE RESPONSÁVEL
   * Resolve o erro: Property 'inviteGuardian' does not exist.
   */
  async inviteGuardian(senderId: string, receiverEmail: string) {
    const receiver = await this.prisma.user.findUnique({
      where: { email: receiverEmail },
    });
    if (!receiver) throw new NotFoundException('Responsável não encontrado.');

    return this.prisma.guardianInvitation.create({
      data: {
        senderId,
        receiverId: receiver.id,
        schoolId: (await this.findOne(senderId)).schoolId!,
        status: InvitationStatus.PENDING,
      },
    });
  }

  /**
   * ACEITE DE CONVITE
   */
  async acceptInvitation(invitationId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const invite = await tx.guardianInvitation.findUnique({
        where: { id: invitationId },
      });
      if (!invite || invite.receiverId !== userId)
        throw new BadRequestException('Convite inválido.');

      await tx.guardianInvitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.ACCEPTED },
      });

      const sender = await tx.user.findUnique({
        where: { id: invite.senderId },
        include: { dependents: true },
      });

      if (!sender) {
        throw new NotFoundException('Remetente do convite não encontrado.');
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          dependents: {
            connect: sender.dependents.map((d) => ({ id: d.id })),
          },
        },
      });

      return { success: true };
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...dataToUpdate } = updateUserDto;
    let hashedPassword: string | undefined;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...dataToUpdate,
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
