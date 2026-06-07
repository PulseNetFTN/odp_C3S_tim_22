import { apiPost} from '../../helpers/api';
import type { ApiResponse } from '../../helpers/api';
import type { IAuthApiService } from './IAuthAPIService';

export const authApiService: IAuthApiService = {
    login(username: string, password: string): Promise<ApiResponse<{accessToken: string}>> {
        return apiPost<{accessToken: string}>('auth/login', { username, password });
    },

    register(
        username: string,
        email: string,
        firstName: string,
        lastName: string,
        password: string,
        bio?: string,
        profileImage?: string
    ): Promise<ApiResponse<{accessToken: string}>> {
        return apiPost<{accessToken: string}>('auth/register', { username, email, firstName, lastName, password, bio, profileImage });
    },

    logout(): Promise<ApiResponse<void>> {
        return apiPost<void>('auth/logout', undefined, 'include');
    },

    refresh(): Promise<ApiResponse<{ accessToken: string }>> {
        return apiPost<{ accessToken: string }>('auth/refresh', undefined, 'include');
    },    
};