import { QueryResultRow } from 'pg';
import { BaseRepository } from '../BaseRepository';
import { IRefreshTokenRepository } from '../../../Domain/repositories/auth/IRefreshTokenRepository';
import { RefreshToken } from '../../../Domain/models/RefreshToken';
import { mapRefreshToken  } from '../../mappers/RefreshTokenMapper';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class RefreshTokenRepository extends BaseRepository implements IRefreshTokenRepository {

    async create(userId: number, tokenHash: string, expiresAt: Date): Promise<RepositoryResult<RefreshToken>> {
        const result = await this.executeWrite(
            'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id',
            [userId, tokenHash, expiresAt]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');
        return RepositoryResult.success(
            new RefreshToken(result.data.insertId, userId, tokenHash, expiresAt, new Date())
        );
    }

        async findByHash(tokenHash: string): Promise<RepositoryResult<RefreshToken>> {
        return this.executeReadOne(
            'SELECT id, user_id, token_hash, expires_at, created_at FROM refresh_tokens WHERE token_hash = $1',
            [tokenHash],
            mapRefreshToken 
        );

    }
        async deleteByHash(tokenHash: string): Promise<boolean>  {
            const result = await this.executeWrite(
                'DELETE FROM refresh_tokens where token_hash = $1',
                [tokenHash]
            );
            return result.ok && result.data.affectedRows > 0;
        }

        async deleteAllForUser(userId: number): Promise<boolean> {
            const result = await this.executeWrite(
                'DELETE FROM refresh_tokens WHERE user_id = $1',
                [userId]
            );
            return result.ok;
        }       
}