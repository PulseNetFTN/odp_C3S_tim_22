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
    GetFollowersInput,
    GetFollowingInput,
} from '../../Domain/types/inputs/UserInputs';
export class UserService implements IUserService {
    public constructor(
        private userRepository: IUserRepository,
        private userFollowRepository: IUserFollowRepository,
        private auditService: IAuditService
    ) {}


    async getAllUsers(): Promise<ServiceResult<UserDto[]>> {
        const users = await this.userRepository.getAll();
        return {success: true, data: users.map(u => this.toDto(u))};
    }

    async getUserById(input: GetUserInput): Promise<ServiceResult<UserDto>> {
        const user = await this.userRepository.getById(input.userId);
        if (!user) {
            return { success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND };   
        }
        return {success: true, data: this.toDto(user)};
    }

    async updateProfile(input: UpdateProfileInput): Promise<ServiceResult<UserDto>> {
        const existing = await this.userRepository.getById(input.userId);

        if(!existing) {
            return {success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND};
        }

        const byUsername = await this.userRepository.getByUsername(input.username);
        if (byUsername && byUsername.id !== input.userId) {
            return { success: false, message: 'Username is already taken', errorCode: ErrorCode.ALREADY_EXISTS };            
        }
        const byEmail = await this.userRepository.getByEmail(input.email);
        if (byEmail && byEmail.id !== input.userId) {
            return { success: false, message: 'Email is already taken', errorCode: ErrorCode.ALREADY_EXISTS };
        }        

        const updated = await this.userRepository.update(
            new User(input.userId, input.username, input.email, input.firstName, input.lastName, input.bio ?? null, input.profileImage ?? null, existing.role, existing.passwordHash)
        );
 
        if (!updated) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }
 
        return { success: true, data: this.toDto(updated) };        
    }

    async updateRole(input: UpdateRoleInput): Promise<ServiceResult<boolean>> {
        const existing = await this.userRepository.getById(input.userId);
        if (!existing) {
            return { success: false, message: 'User not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const oldRole = existing.role;

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
        const target = await this.userRepository.getById(input.followingId);
        if (!target) {
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

    async getFollowers(input: GetFollowersInput): Promise<ServiceResult<UserDto[]>> {
        const ids = await this.userFollowRepository.getFollowerIds(input.userId);
        if (ids.length === 0) return {success: true, data: []};
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