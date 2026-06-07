import { UserDto } from '../../Domain/DTOs/users/UserDto';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { User } from '../../Domain/models/User';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { IUserFollowRepository } from '../../Domain/repositories/users/IUserFollowRepository';
import { IAuditService } from '../../Domain/services/audit/IAuditService';
import { IUserService } from '../../Domain/services/users/IUserService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import {
    UpdateProfileInput,
    UpdateRoleInput,
    SearchUsersInput,
    GetUserInput,
    FollowUserInput,
    UnfollowUserInput,
    RemoveFollowerInput,
    GetFollowersInput,
    GetFollowingInput,
} from '../../Domain/types/inputs/UserInputs';
import bcrypt from 'bcryptjs';
import { ICommentReadWriteRepository } from '../../Domain/repositories/comments/ICommentReadWriteRepository';
import { IPostRepository } from '../../Domain/repositories/post_repository/IPostRepository';
import { UserProfileDto } from '../../Domain/DTOs/users/UserDto';

export class UserService implements IUserService {
    private readonly saltRounds: number = parseInt(process.env.SALT_ROUNDS || '10', 10);

    public constructor(
        private userRepository: IUserRepository,
        private userFollowRepository: IUserFollowRepository,
        private auditService: IAuditService,
        private postRepository: IPostRepository,
        private commentRepository: ICommentReadWriteRepository
    ) {}

    async getAllUsers(): Promise<ServiceResult<UserDto[]>> {
        const users = await this.userRepository.getAll();
        return { success: true, data: users.map(u => this.toDto(u)) };
    }

    async getUserById(input: GetUserInput): Promise<ServiceResult<UserDto>> {
        const result = await this.userRepository.getById(input.userId);
        if (!result.ok) {
            return { success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND };
        }
        return { success: true, data: this.toDto(result.data) };
    }

    async updateProfile(input: UpdateProfileInput): Promise<ServiceResult<UserDto>> {
        const existingResult = await this.userRepository.getById(input.userId);
        if (!existingResult.ok) {
            return { success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const existing = existingResult.data;

        const byUsername = await this.userRepository.getByUsername(input.username);
        if (byUsername.ok && byUsername.data.id !== input.userId) {
            return { success: false, message: 'Username is already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }
        const byEmail = await this.userRepository.getByEmail(input.email);
        if (byEmail.ok && byEmail.data.id !== input.userId) {
            return { success: false, message: 'Email is already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }

        let passwordHash = existing.passwordHash;

        if (input.password?.trim()) {
            if(!input.currentPassword) {
              return { success: false, message: 'Current password is required to set a new one', errorCode: ErrorCode.VALIDATION_ERROR };               
            }
            const valid = await bcrypt.compare(input.currentPassword, existing.passwordHash);
            if (!valid) {
                return { success: false, message: 'Current password is incorrect', errorCode: ErrorCode.UNAUTHORIZED };
            }           
            passwordHash = await bcrypt.hash(input.password, this.saltRounds);
        }

        const updateResult = await this.userRepository.update(
            new User(input.userId, input.username, input.email, input.firstName, input.lastName, input.bio ?? null, input.profileImage ?? null, existing.role, passwordHash)
        );

        if (!updateResult.ok) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        return { success: true, data: this.toDto(updateResult.data) };
    }

    async getUserProfile(userId: number, currentUserId?: number): Promise<ServiceResult<UserProfileDto>> {
        const userResult = await this.userRepository.getById(userId);
        if (!userResult.ok) {
            return { success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const user = userResult.data;

        const [postCount, commentCount, followerCount, followingCount] = await Promise.all([
            this.postRepository.getPostCountByAuthor(userId),
            this.commentRepository.getCommentCountByAuthor(userId),
            this.userFollowRepository.getFollowerCount(userId),
            this.userFollowRepository.getFollowingCount(userId),
        ]);

        let isFollowing = false;
        if (currentUserId && currentUserId !== userId) {
            isFollowing = await this.userFollowRepository.isFollowing(currentUserId, userId);
        }

        const profileDto = new UserProfileDto(
            user.id, user.username, user.email, user.firstName, user.lastName,
            user.bio, user.profileImage, user.role, user.createdAt,
            {
                postCount,
                commentCount,
                followerCount,
                followingCount,
            },
            isFollowing
        );

        return { success: true, data: profileDto };
    }

    async updateRole(input: UpdateRoleInput): Promise<ServiceResult<boolean>> {
        const existingResult = await this.userRepository.getById(input.userId);
        if (!existingResult.ok) {
            return { success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const oldRole = existingResult.data.role;

        const result = await this.userRepository.updateRole(input.userId, input.role);
        if (!result) {
            return { success: false, message: 'Role update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        await this.auditService.log({
            userId: input.userId,
            action: 'ROLE_CHANGED',
            entityType: 'user',
            entityId: input.userId,
            details: JSON.stringify({ oldRole, newRole: input.role }),
        });

        return { success: true, data: true };
    }

    async searchUsers(input: SearchUsersInput): Promise<ServiceResult<UserDto[]>> {
        const users = await this.userRepository.searchByUsername(input.query);
        return { success: true, data: users.map(u => this.toDto(u)) };
    }

    async followUser(input: FollowUserInput): Promise<ServiceResult<boolean>> {
        if (input.followerId === input.followingId) {
            return { success: false, message: 'You cannot follow yourself', errorCode: ErrorCode.VALIDATION_ERROR };
        }
        const targetResult = await this.userRepository.getById(input.followingId);
        if (!targetResult.ok) {
            return { success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const alreadyFollowing = await this.userFollowRepository.isFollowing(input.followerId, input.followingId);
        if (alreadyFollowing) {
            return { success: false, message: 'Already following this user', errorCode: ErrorCode.ALREADY_EXISTS };
        }
        const result = await this.userFollowRepository.follow(input.followerId, input.followingId);
        if (!result) {
            return { success: false, message: 'Follow failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async unfollowUser(input: UnfollowUserInput): Promise<ServiceResult<boolean>> {
        const isFollowing = await this.userFollowRepository.isFollowing(input.followerId, input.followingId);
        if (!isFollowing) {
            return { success: false, message: 'You are not following this user', errorCode: ErrorCode.NOT_FOUND };
        }
        const result = await this.userFollowRepository.unfollow(input.followerId, input.followingId);
        if (!result) {
            return { success: false, message: 'Unfollow failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async removeFollower(input: RemoveFollowerInput): Promise<ServiceResult<boolean>> {
        const isFollowing = await this.userFollowRepository.isFollowing(input.followerId, input.userId);
        if (!isFollowing) {
            return { success: false, message: 'This user is not following you', errorCode: ErrorCode.NOT_FOUND };
        }
        const result = await this.userFollowRepository.unfollow(input.followerId, input.userId);
        if (!result) {
            return { success: false, message: 'Remove follower failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async getFollowers(input: GetFollowersInput): Promise<ServiceResult<UserDto[]>> {
        const ids = await this.userFollowRepository.getFollowerIds(input.userId);
        if (ids.length === 0) return { success: true, data: [] };
        const users = await this.userRepository.getByIds(ids);
        return { success: true, data: users.map(u => this.toDto(u)) };
    }

    async getFollowing(input: GetFollowingInput): Promise<ServiceResult<UserDto[]>> {
        const ids = await this.userFollowRepository.getFollowingIds(input.userId);
        if (ids.length === 0) return { success: true, data: [] };
        const users = await this.userRepository.getByIds(ids);
        return { success: true, data: users.map(u => this.toDto(u)) };
    }

    private toDto(u: User): UserDto {
        return new UserDto(u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.profileImage, u.role);
    }
}