'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export interface DashboardMetrics {
    processedVolume: number;
    activeTenants: number;
    platformStatus: string;
}

export function useDashboard(user: any) {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [systems, setSystems] = useState<any[]>([]);
    const [schools, setSchools] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user) return;

        setIsFetching(true);
        setError(null);
        try {
            const [metricsData, systemsData, schoolsData, plansData] = await Promise.all([
                apiFetch('/global-admin/metrics'),
                apiFetch('/platform/systems'),
                apiFetch('/tenancy/schools'),
                apiFetch('/platform/plans')
            ]);
            setMetrics(metricsData);
            setSystems(systemsData);
            setSchools(schoolsData);
            setPlans(plansData);
        } catch (err: any) {
            console.error("Erro ao carregar dados do console:", err);
            setError(err.message || 'Falha ao sincronizar dados com o Kernel');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    return {
        metrics,
        systems,
        schools,
        plans,
        isFetching,
        error,
        refresh: fetchData
    };
}
