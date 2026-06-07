import { ServiceResult } from '../../types/ServiceResult';
import { LoginInput, RegisterInput } from '../../types/inputs/AuthInputs';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    refreshExpiresAt: Date;
}

export interface IAuthService {
    login(input: LoginInput): Promise<ServiceResult<AuthTokens>>;
    register(input: RegisterInput): Promise<ServiceResult<AuthTokens>>;
    refresh(rawRefreshToken: string): Promise<ServiceResult<AuthTokens>>;
    logout(rawRefreshToken: string): Promise<ServiceResult<void>>;
}