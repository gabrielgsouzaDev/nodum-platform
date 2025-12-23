import {
    Injectable,
    ExecutionContext,
    Logger,
    CallHandler,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Observable, of } from 'rxjs'; // Import 'of' to return observable immediately
import { tap } from 'rxjs/operators';
import { AuthenticatedUserPayload } from '../../modules/auth/dto/user-payload.dto';

/**
 * TENANT CACHE INTERCEPTOR v3.8.25
 * Garante isolamento de cache por Tenant (School) e User.
 * Segue a Regra de Ouro: {schoolId}:{userId}:{route}
 * Evita vazamento de dados entre escolas.
 */
@Injectable()
export class TenantCacheInterceptor extends CacheInterceptor {
    private readonly logger = new Logger(TenantCacheInterceptor.name);

    trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest();
        const user = request.user as AuthenticatedUserPayload;
        const url = request.url;

        // 1. Se não houver user ou schoolId, NÃO CACHEIA (Segurança)
        if (!user || !user.schoolId || !user.id) {
            this.logger.warn(
                `⚠️ Tentativa de cache sem contexto de Tenant/User em ${url}. Ignorando cache.`,
            );
            return undefined;
        }

        // 2. Chave composta: schoolId:userId:route
        // Isso garante que alunos diferentes e escolas diferentes NUNCA compartilhem o mesmo cache
        // para endpoints autenticados.
        const cacheKey = `${user.schoolId}:${user.id}:${url}`;

        // Debug em desenvolvimento
        if (process.env.NODE_ENV !== 'production') {
            this.logger.debug(`🔐 Cache Key Gerada: ${cacheKey}`);
        }

        return cacheKey;
    }
}
