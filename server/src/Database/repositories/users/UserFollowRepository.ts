import { BaseRepository } from '../BaseRepository';
import { IUserFollowRepository } from '../../../Domain/repositories/users/IUserFollowRepository';

export class UserFollowRepository extends BaseRepository implements IUserFollowRepository {

    async follow(followerId: number, followingId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [followerId, followingId]
        );
        return result.ok;
    }

    async unfollow(followerId: number, followingId: number): Promise<boolean> {
        const result = await this.executeWrite(
            'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );
        return result.ok && result.data.affectedRows > 0;
    }

    async isFollowing(followerId: number, followingId: number): Promise<boolean> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM user_follows WHERE follower_id = $1 AND following_id = $2',
            [followerId, followingId]
        );
        return result.ok && result.data > 0;
    }

    async getFollowerIds(userId: number): Promise<number[]> {
        return this.executeRead(
            'SELECT follower_id FROM user_follows WHERE following_id = $1',
            [userId],
            (r) => r.follower_id as number
        );
    }

    async getFollowingIds(userId: number): Promise<number[]> {
        return this.executeRead(
            'SELECT following_id FROM user_follows WHERE follower_id = $1',
            [userId],
            (r) => r.following_id as number
        );
    }

    async getFollowerCount(userId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM user_follows WHERE following_id = $1',
            [userId]
        );
        return result.ok ? result.data : 0;
    }

    async getFollowingCount(userId: number): Promise<number> {
        const result = await this.executeScalar<number>(
            'SELECT COUNT(*)::int as count FROM user_follows WHERE follower_id = $1',
            [userId]
        );
        return result.ok ? result.data : 0;
    }
}
