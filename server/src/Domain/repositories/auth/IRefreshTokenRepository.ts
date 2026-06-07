import { RefreshToken } from "../../models/RefreshToken";
import { RepositoryResult } from "../../types/RepositoryResult";

export interface IRefreshTokenRepository {
    create(userId: number, tokenHash: string, expiresAt: Date) : Promise<RepositoryResult<RefreshToken>>;
    findByHash(tokenHash: string): Promise<RepositoryResult<RefreshToken>>;
    deleteByHash(tokenHash: string): Promise<boolean>;
    deleteAllForUser(userId: number): Promise<boolean>;

}