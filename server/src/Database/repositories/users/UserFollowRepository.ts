import { BaseRepository } from '../BaseRepository';
import { IUserFollowRepository } from '../../../Domain/repositories/users/IUserFollowRepository';
import { RowDataPacket } from 'mysql2';

export class UserFollowRepository extends BaseRepository implements IUserFollowRepository {

    async follow(followerId: number, followingId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT IGNORE INTO user_follows (follower_id, following_id) VALUES (?, ?)',
            [followerId, followingId]
        );
        return result !== null;
    }

    async unfollow(followerId: number, followingId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?',
            [followerId, followingId]
        );
        return (result?.affectedRows ?? 0) > 0;
    }

    async isFollowing(followerId: number, followingId: number): Promise<boolean> {
        const count = await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ? AND following_id = ?',
            [followerId, followingId]
        );
        return (count ?? 0) > 0;
    }

    async getFollowerIds(userId: number): Promise<number[]> {
        return this.executeRead(
            'SELECT follower_id FROM user_follows WHERE following_id = ?',
            [userId],
            (r: RowDataPacket) => r.follower_id as number
        );
    }

    async getFollowingIds(userId: number): Promise<number[]> {
        return this.executeRead(
            'SELECT following_id FROM user_follows WHERE follower_id = ?',
            [userId],
            (r: RowDataPacket) => r.following_id as number
        );
    }

    async getFollowerCount(userId: number): Promise<number> {
        return await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM user_follows WHERE following_id = ?',
            [userId]
        ) ?? 0;
    }

    async getFollowingCount(userId: number): Promise<number> {
        return await this.executeScalar<number>(
            'SELECT COUNT(*) as count FROM user_follows WHERE follower_id = ?',
            [userId]
        ) ?? 0;
    }
}