import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { storage } from '../../helpers/localStorage';
import type { AuthContextType } from '../../types/auth/AuthContextType';
import type { AuthUser } from '../../types/auth/AuthUser';
import type { JwtTokenClaims } from '../../types/auth/JwtTokenClaims';
import { AUTH } from '../../constants/auth';
import { API } from '../../constants/api';
import { authApiService } from '../../api_services/auth/AuthAPIService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): JwtTokenClaims | null {
    try {
        const decoded = jwtDecode<JwtTokenClaims>(token);
        if (decoded.id && decoded.username && decoded.role) return decoded;
        return null;
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwtDecode(token);
        if (!decoded.exp) return false;
        return decoded.exp < Date.now() / AUTH.JWT_TIMESTAMP_DIVISOR;
    } catch {
        return true;
    }
}

function tokenToUser(token: string): AuthUser | null {
    if (isTokenExpired(token)) return null;
    const claims = decodeToken(token);
    if (!claims) return null;
    return { id: claims.id, username: claims.username, role: claims.role, profileImage: null };
}

function resolveInitialAuth(): { user: AuthUser | null; token: string | null } {
    const saved = storage.get(AUTH.TOKEN_KEY);
    if (!saved) return { user: null, token: null };
    const user = tokenToUser(saved);
    if (!user) {
        storage.remove(AUTH.TOKEN_KEY);
        return { user: null, token: null };
    }
    return { user, token: saved };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const initial = resolveInitialAuth();

    const [user, setUser] = useState<AuthUser | null>(initial.user);
    const [token, setToken] = useState<string | null>(initial.token);
    const [isLoading, setIsLoading] = useState(!initial.token);

    async function fetchProfile(authToken: string): Promise<string | null> {
        try {
            const res = await fetch(`${API.BASE_URL}users/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            const data = await res.json();
            if (data.success && data.data) return data.data.profileImage ?? null;
            return null;
        } catch {
            return null;
        }
    }

    useEffect(() => {
        if (initial.token) return;

        authApiService.refresh()
            .then(result => {
                if (result.success && result.data) {
                    const resolved = tokenToUser(result.data.accessToken);
                    if (resolved) {
                        setToken(result.data.accessToken);
                        setUser(resolved);
                        storage.set(AUTH.TOKEN_KEY, result.data.accessToken);
                        fetchProfile(result.data.accessToken).then(profileImage => {
                            setUser(prev => prev ? { ...prev, profileImage } : prev);
                        });
                    }
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    async function login(newToken: string): Promise<void> {
        const resolved = tokenToUser(newToken);
        if (!resolved) return;
        setToken(newToken);
        setUser(resolved);
        storage.set(AUTH.TOKEN_KEY, newToken);
        const profileImage = await fetchProfile(newToken);
        setUser(prev => prev ? { ...prev, profileImage } : prev);
    }

    async function logout(): Promise<void> {
        try {
            await authApiService.logout();
        } catch {
            // best effort
        }
        setToken(null);
        setUser(null);
        storage.remove(AUTH.TOKEN_KEY);
    }

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
