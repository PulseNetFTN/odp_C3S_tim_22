import type { AuthUser } from './AuthUser';

export type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
};