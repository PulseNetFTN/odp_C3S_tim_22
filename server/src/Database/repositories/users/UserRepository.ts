import { BaseRepository } from '../BaseRepository';
import { IUserRepository } from '../../../Domain/repositories/users/IUserRepository';
import { User } from '../../../Domain/models/User';
import { mapUser, USER_FIELDS, USER_FIELDS_PUBLIC } from '../../mappers/UserMapper';
import { RepositoryResult } from '../../../Domain/types/RepositoryResult';

export class UserRepository extends BaseRepository implements IUserRepository {

    async create(user: User): Promise<RepositoryResult<User>> {
        const result = await this.executeWrite(
            'INSERT INTO users (username, email, first_name, last_name, bio, profile_image, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.passwordHash, user.role]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (!result.data.insertId) return RepositoryResult.failure('Insert returned no ID');
        return RepositoryResult.success(
            new User(result.data.insertId, user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.role, user.passwordHash)
        );
    }

    async getById(id: number): Promise<RepositoryResult<User>> {
        return this.executeReadOne(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [id], mapUser);
    }

    async getByIds(ids: number[]): Promise<User[]> {
        if (ids.length === 0) return [];
        const placeholders = this.buildPlaceholders(ids);
        return this.executeRead(
            `SELECT ${USER_FIELDS_PUBLIC} FROM users WHERE id IN (${placeholders})`,
            ids,
            mapUser
        );
    }

    async getByUsername(username: string): Promise<RepositoryResult<User>> {
        return this.executeReadOne(`SELECT ${USER_FIELDS} FROM users WHERE username = $1`, [username], mapUser);
    }

    async getByEmail(email: string): Promise<RepositoryResult<User>> {
        return this.executeReadOne(`SELECT ${USER_FIELDS} FROM users WHERE email = $1`, [email], mapUser);
    }

    async getAll(): Promise<User[]> {
        return this.executeRead(`SELECT ${USER_FIELDS_PUBLIC} FROM users ORDER BY id ASC`, [], mapUser);
    }

    async update(user: User): Promise<RepositoryResult<User>> {
        const result = await this.executeWrite(
            'UPDATE users SET username = $1, email = $2, first_name = $3, last_name = $4, bio = $5, profile_image = $6, password_hash = $7 WHERE id = $8',
            [user.username, user.email, user.firstName, user.lastName, user.bio, user.profileImage, user.passwordHash, user.id]
        );
        if (!result.ok) return RepositoryResult.failure(result.message);
        if (result.data.affectedRows === 0) return RepositoryResult.notFound('User not found for update');
        return RepositoryResult.success(user);
    }

    async updateRole(id: number, role: string): Promise<boolean> {
        const result = await this.executeWrite('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        return result.ok && result.data.affectedRows > 0;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.executeWrite('DELETE FROM users WHERE id = $1', [id]);
        return result.ok && result.data.affectedRows > 0;
    }

    async searchByUsername(query: string): Promise<User[]> {
        return this.executeRead(
            `SELECT ${USER_FIELDS_PUBLIC} FROM users WHERE username ILIKE $1 LIMIT 20`,
            [`%${query}%`],
            mapUser
        );
    }
}
