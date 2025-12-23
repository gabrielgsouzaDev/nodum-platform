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
 * SEED MASTER v3.8.28 - NODUM KERNEL SOBERANO
 * Foco: Sincronização de Rebranding, Chaves HMAC e Planos Industriais.
 * Localização: apps/backend/prisma/seed.ts
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não encontrada no arquivo .env');
}

// Configuração de Pool para compatibilidade com Supabase
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🏗️  Iniciando Sincronização de Soberania (Nodum Kernel)...');

  const saltRounds = 10;
  const adminPassword = 'Diel@0002323';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
  const masterEmail = 'admin@nodum.io';

  // --- 1. VERTICAIS DE NEGÓCIO (SISTEMAS AFILIADOS) ---
  console.log('🌐 Semeando Verticais de Operação...');
  const ambraSystem = await (prisma as any).platformSystem.upsert({
    where: { slug: 'ambra' },
    update: { name: 'AMBRA (Food & Experience)' },
    create: {
      id: '00000000-0000-4000-a000-000000000001',
      name: 'AMBRA (Food & Experience)',
      slug: 'ambra',
      description: 'Sistema operacional de alta performance para cantinas e nutrição escolar.',
      status: 'ACTIVE',
    },
  });

  // --- 2. PLANOS SAAS (CONTRATOS DE LICENCIAMENTO) ---
  console.log('📦 Semeando Planos SaaS...');
  const plans = [
    { 
      id: '9657c91e-3558-45b0-9f5b-b9d5690b9687', 
      name: 'Plano Essencial', 
      price: 249.9 
    },
    { 
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
      name: 'Plano Pro', 
      price: 449.9 
    },
    { 
      id: 'de305d54-75b4-431b-adb2-eb6b9e546014', 
      name: 'Plano Enterprise (White Label)', 
      price: 0.0 
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
          auditChain: true,
          aiReports: plan.name.includes('Pro') || plan.name.includes('Enterprise'),
          prioritySupport: plan.name.includes('Enterprise')
        },
      },
    });
  }

  // --- 3. CHAVE MESTRA DE AUDITORIA (HMAC CHAIN) ---
  console.log('🔐 Semeando Chave de Custódia Forense...');
  await (prisma as any).auditKey.upsert({
    where: { keyAlias: 'master_2025' },
    update: { isActive: true },
    create: {
      keyAlias: 'master_2025',
      secret: 'nodum_master_shield_fallback_secret_2025',
      isActive: true,
    },
  });

  // --- 4. GLOBAL ADMIN (GABRIEL - O CRIADOR) ---
  console.log('👑 Inaugurando Acesso Master Nodum...');
  const admin = await prisma.user.upsert({
    where: { email: masterEmail },
    update: { 
      passwordHash: hashedAdminPassword,
      role: UserRole.GLOBAL_ADMIN 
    },
    create: {
      id: '00000000-0000-4000-b000-000000000001',
      name: 'Gabriel Nodum Master',
      email: masterEmail,
      passwordHash: hashedAdminPassword,
      role: UserRole.GLOBAL_ADMIN,
    },
  });

  // GARANTIR CARTEIRA SOBERANA (LEDGER FUNDATION)
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      balance: 0.0,
      dailySpendLimit: 0.0,
      allowedDays: [0, 1, 2, 3, 4, 5, 6],
    },
  });

  console.log('✅ Ecossistema NODUM inicializado com sucesso.');
  console.log(`🚀 Acesso Master: ${masterEmail}`);
  console.log(`📡 Vertical Ativa: ${ambraSystem.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Falha Crítica no Processo de Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
  