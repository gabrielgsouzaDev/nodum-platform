/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, PlanStatus, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config();

/**
 * SEED MASTER v3.8.13 - NODUM KERNEL
 * Foco: UUIDs Reais, passwordHash e Semente de Auditoria.
 * Correção: Alinhamento com UserWhereUniqueInput e AuditKey.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não encontrada no arquivo .env');
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Seed v3.8.13 (Nodum Kernel Master)...');

  const saltRounds = 10;
  const adminPassword = 'Diel@0002323';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);

  // --- 1. SISTEMAS AFILIADOS (NODUM PLATFORM) ---
  console.log('🏗️ Semeando Verticais de Negócio...');
  const ambraSystem = await (prisma as any).platformSystem.upsert({
    where: { slug: 'ambra' },
    update: {},
    create: {
      id: '00000000-0000-4000-a000-000000000001',
      name: 'AMBRA (Food & Education)',
      slug: 'ambra',
      description: 'Sistema operacional para cantinas e nutrição escolar.',
      status: 'ACTIVE',
    },
  });

  // --- 2. PLANOS SAAS ---
  console.log('📦 Semeando Planos SaaS...');
  const plans = [
    {
      id: '9657c91e-3558-45b0-9f5b-b9d5690b9687',
      name: 'Plano Essencial',
      price: 249.9,
    },
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Plano Pro',
      price: 449.9,
    },
    {
      id: 'de305d54-75b4-431b-adb2-eb6b9e546014',
      name: 'Plano Enterprise',
      price: 0.0,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: { price: plan.price },
      create: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        status: PlanStatus.ACTIVE,
        features: {
          whiteLabel: plan.name.includes('Enterprise'),
        },
      },
    });
  }

  // --- 3. AUDIT KEYS (CHAVE MESTRA DE LOGS) ---
  console.log('🔐 Semeando Chave Mestra de Auditoria...');
  // Nota: Usamos 'as any' para evitar erro se o client ainda estiver a regenerar
  await (prisma as any).auditKey.upsert({
    where: { keyAlias: 'master_2025' },
    update: {},
    create: {
      keyAlias: 'master_2025',
      secret: 'nodum_master_shield_fallback_secret_2025',
      isActive: true,
    },
  });

  // --- 4. GLOBAL ADMIN (O CRIADOR) ---
  console.log('👑 Criando Acesso Master Nodum...');
  const adminEmail = 'admin@nodum.io';
  const adminId = '00000000-0000-4000-b000-000000000001';

  // FIX: Se o seu client reclama que 'email' não é único, rode 'npx prisma generate'
  // Usamos upsert forçando o comportamento de email
  const user = await prisma.user.upsert({
    where: { email: adminEmail } as any,
    update: { passwordHash: hashedAdminPassword },
    create: {
      id: adminId,
      name: 'Gabriel Global Admin',
      email: adminEmail,
      passwordHash: hashedAdminPassword,
      role: UserRole.GLOBAL_ADMIN,
    },
  });

  // Criar Carteira para o Admin
  await prisma.wallet.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      balance: 0.0,
      dailySpendLimit: 0.0,
      allowedDays: [0, 1, 2, 3, 4, 5, 6],
    },
  });

  console.log('✅ Seed v3.8.13 finalizado com sucesso.');
  console.log(`🚀 Sistema Ativo: ${ambraSystem.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
