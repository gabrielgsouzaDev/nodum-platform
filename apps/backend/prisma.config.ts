import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Carrega o .env para que a CLI (Migrate/Generate/Seed) acesse as variáveis
dotenv.config();

export default defineConfig({
  datasource: {
    /**
     * Para a CLI do Prisma (Design-time), usamos a DIRECT_URL.
     * Isso é necessário para que as migrações funcionem corretamente no Supabase,
     * contornando as restrições de comandos DDL em conexões com Pooler (porta 6543).
     */
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
