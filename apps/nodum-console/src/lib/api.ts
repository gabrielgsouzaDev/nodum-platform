/**
 * API Client para o NODUM Console
 * Gerencia tokens JWT e comunicação com o Kernel Backend.
 */

const BASE_URL = 'http://localhost:3000';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nodum_token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('nodum_token');
            window.location.href = '/login';
        }
        throw new Error('Não autorizado. Redirecionando para login...');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro na requisição à API');
    }

    return response.json();
}
