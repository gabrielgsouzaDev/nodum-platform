import { useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export interface School {
    id: string;
    name: string;
    taxId: string;
    slug: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
    systemId: string;
    planId: string;
    _count?: { users: number };
}

export function useSchools() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const createSchool = useCallback(async (data: Partial<School>) => {
        setIsSubmitting(true);
        try {
            const response = await apiFetch('/tenancy/schools', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            toast.success('Escola provisionada!', {
                description: `${data.name} foi adicionada ao Kernel.`,
            });
            return response;
        } catch (error: any) {
            toast.error('Erro no provisionamento', {
                description: error.message,
            });
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const updateSchool = useCallback(async (id: string, data: Partial<School>) => {
        setIsSubmitting(true);
        try {
            const response = await apiFetch(`/tenancy/schools/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            });
            toast.success('Escola atualizada.');
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

    return {
        createSchool,
        updateSchool,
        isSubmitting,
    };
}
