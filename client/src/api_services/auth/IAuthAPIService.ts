import type { ApiResponse } from '../../helpers/api';

export interface IAuthApiService {
    login(username: string, password: string): Promise<ApiResponse<{accessToken: string}>>;
    register(username: string, email: string, firstName: string, lastName: string, password: string, bio?: string, profileImage?: string): Promise<ApiResponse<{accessToken: string}>>;
    logout(): Promise<ApiResponse<void>>;
    refresh(): Promise<ApiResponse<{ accessToken: string }>>;
}