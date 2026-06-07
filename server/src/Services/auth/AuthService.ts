import bcrypt from 'bcryptjs';
import { IAuthService, AuthTokens } from '../../Domain/services/auth/IAuthService';
import { IRefreshTokenRepository } from '../../Domain/repositories/auth/IRefreshTokenRepository';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { User } from '../../Domain/models/User';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import { LoginInput, RegisterInput } from '../../Domain/types/inputs/AuthInputs';
import { TokenService } from './TokenService';

export class AuthService implements IAuthService {
    private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || '10', 10);

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly refreshTokenRepository: IRefreshTokenRepository,
        private readonly tokenService: TokenService,
    ) {}

    private async issueTokens(userId: number, username: string, role: string): Promise<AuthTokens> {
        const accessToken = this.tokenService.signAccessToken({id: userId, username, role: role as any});
        const { raw, hash, expiresAt} = this.tokenService.generateRefreshToken();
        await this.refreshTokenRepository.create(userId, hash, expiresAt);
        return { accessToken, refreshToken: raw, refreshExpiresAt: expiresAt };
    }

    async login(input: LoginInput): Promise<ServiceResult<AuthTokens>> {
        const userResult = await this.userRepository.getByUsername(input.username);
        if (!userResult.ok) {
            return { success: false, message: 'Invalid username or password', errorCode: ErrorCode.UNAUTHORIZED };
        }
        const user = userResult.data;
        const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!passwordValid) {
            return { success: false, message: 'Invalid username or password', errorCode: ErrorCode.UNAUTHORIZED };
        }
        const tokens = await this.issueTokens(user.id, user.username, user.role);
        return { success: true, data: tokens };
    }


    async register(input: RegisterInput): Promise<ServiceResult<AuthTokens>> {
        const existingUsername = await this.userRepository.getByUsername(input.username);
        if (existingUsername.ok) {
            return { success: false, message: 'Username is already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }
        const existingEmail = await this.userRepository.getByEmail(input.email);
        if (existingEmail.ok) {
            return { success: false, message: 'Email is already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }
        const hashedPassword = await bcrypt.hash(input.password, this.saltRounds);
        const newUserResult = await this.userRepository.create(
            new User(0, input.username, input.email, input.firstName, input.lastName, input.bio ?? null, input.profileImage ?? null, 'user', hashedPassword)
        );
        if (!newUserResult.ok) {
            return { success: false, message: 'Registration failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        const newUser = newUserResult.data;
        const tokens = await this.issueTokens(newUser.id, newUser.username, newUser.role);
        return { success: true, data: tokens };
    }    


        async refresh(rawRefreshToken: string): Promise<ServiceResult<AuthTokens>> {
            const hash = this.tokenService.hashToken(rawRefreshToken);
            const tokenResult = await this.refreshTokenRepository.findByHash(hash);

            if (!tokenResult.ok) {
                return { success: false, message: 'Invalid refresh token', errorCode: ErrorCode.UNAUTHORIZED };
            }

            const stored = tokenResult.data;
            if (stored.expiresAt < new Date()) {
                await this.refreshTokenRepository.deleteByHash(hash);
                return { success: false, message: 'Refresh token expired', errorCode: ErrorCode.UNAUTHORIZED };
            }

            await this.refreshTokenRepository.deleteByHash(hash);
            const userResult = await this.userRepository.getById(stored.userId);
            if (!userResult.ok) {
                return { success: false, message: 'User not found', errorCode: ErrorCode.UNAUTHORIZED };
            }            

            const user = userResult.data;
            const tokens = await this.issueTokens(user.id, user.username, user.role);
            return { success: true, data: tokens};
        }

        async logout(rawRefreshToken: string): Promise<ServiceResult<void>> {
        const hash = this.tokenService.hashToken(rawRefreshToken);
        await this.refreshTokenRepository.deleteByHash(hash);
        return { success: true };
    }
}