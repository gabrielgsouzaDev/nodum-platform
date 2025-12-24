import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export interface PlatformSystem {
    id: string;
    name: string;
    slug: string;
    description?: string;
    status: 'ACTIVE' | 'INACTIVE';
    _count?: { schools: number };
}

export function useSystems() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createSystem = useCallback(async (data: Partial<PlatformSystem>) => {
        setIsSubmitting(true);
        try {
            const response = await apiFetch('/platform/systems', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            toast.success('Sistema criado com sucesso!', {
                description: `O sistema ${data.name} agora faz parte do ecossistema.`,
            });
            return response;
        } catch (error: any) {
            toast.error('Erro ao criar sistema', {
                description: error.message || 'Verifique os dados e tente novamente.',
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const updateSystem = useCallback(async (id: string, data: Partial<PlatformSystem>) => {
        setIsSubmitting(true);
        try {
            const response = await apiFetch(`/platform/systems/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
            toast.success('Sistema atualizado!', {
                description: 'As alterações foram sincronizadas com o Kernel.',
            });
            return response;
        } catch (error: any) {
            toast.error('Erro na atualização', {
                description: error.message,
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const deleteSystem = useCallback(async (id: string) => {
        setIsSubmitting(true);
        try {
            await apiFetch(`/platform/systems/${id}`, {
                method: 'DELETE',
            });
            toast.success('Sistema removido.');
        } catch (error: any) {
            toast.error('Impossível remover sistema', {
                description: error.message,
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return {
        createSystem,
        updateSystem,
        deleteSystem,
        isSubmitting,
    };
}
