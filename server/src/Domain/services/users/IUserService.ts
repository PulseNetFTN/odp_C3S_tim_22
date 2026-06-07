import { UserDto } from '../../DTOs/users/UserDto';
import { ServiceResult } from '../../types/ServiceResult';
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
} from '../../types/inputs/UserInputs';

export interface IUserService {
    getAllUsers(): Promise<ServiceResult<UserDto[]>>;
    getUserById(input: GetUserInput): Promise<ServiceResult<UserDto>>;
    getUserProfile(userId: number, currentUserId?: number): Promise<ServiceResult<UserDto>>;
    updateProfile(input: UpdateProfileInput): Promise<ServiceResult<UserDto>>;
    updateRole(input: UpdateRoleInput): Promise<ServiceResult<boolean>>;
    searchUsers(input: SearchUsersInput): Promise<ServiceResult<UserDto[]>>;
    followUser(input: FollowUserInput): Promise<ServiceResult<boolean>>;
    unfollowUser(input: UnfollowUserInput): Promise<ServiceResult<boolean>>;
    removeFollower(input: RemoveFollowerInput): Promise<ServiceResult<boolean>>;
    getFollowers(input: GetFollowersInput): Promise<ServiceResult<UserDto[]>>;
    getFollowing(input: GetFollowingInput): Promise<ServiceResult<UserDto[]>>;
}
