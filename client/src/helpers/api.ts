import { API } from '../constants/api';
import { AUTH } from '../constants/auth';


export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
};

function getToken(): string | null {
    return localStorage.getItem(AUTH.TOKEN_KEY);
}

function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
    try {
        return await res.json();
    } catch {
        return { success: false, message: 'Invalid server response' };
    }
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API.BASE_URL}${path}`, { headers: buildHeaders() });
        return handleResponse<T>(res);
    } catch {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function apiPost<T>(path: string, body?: unknown, credentials?: RequestCredentials): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API.BASE_URL}${path}`, {
            method: 'POST',
            headers: buildHeaders(),
            body: body ? JSON.stringify(body) : undefined,
            credentials,
        });
        return handleResponse<T>(res);
    } catch {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function apiPut<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API.BASE_URL}${path}`, {
            method: 'PUT',
            headers: buildHeaders(),
            body: body ? JSON.stringify(body) : undefined,
        });
        return handleResponse<T>(res);
    } catch {
        return { success: false, message: 'Network error. Please try again.' };
    }
}

export async function apiDelete<T>(path: string): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(`${API.BASE_URL}${path}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        });
        return handleResponse<T>(res);
    } catch {
        return { success: false, message: 'Network error. Please try again.' };
    }
}