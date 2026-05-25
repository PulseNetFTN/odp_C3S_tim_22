import { PostDto } from '../../DTOs/post/PostDto';
import { ServiceResult } from '../../types/ServiceResult';
import {
    CreatePostInput,
    UpdatePostInput,
    DeletePostInput,
    GetPostInput,
    GetCommunityPostsInput,
    GetFeedInput,
    GetPublicPostsInput,
    LikePostInput,
    UnlikePostInput,
    AddTagInput,
    RemoveTagInput,
} from '../../types/inputs/PostInputs';

export interface IPostService {
    createPost(input: CreatePostInput): Promise<ServiceResult<PostDto>>;
    getAllPosts(): Promise<ServiceResult<PostDto[]>>;
    getPostById(input: GetPostInput): Promise<ServiceResult<PostDto>>;
    getCommunityPosts(input: GetCommunityPostsInput): Promise<ServiceResult<PostDto[]>>;
    getFeed(input: GetFeedInput): Promise<ServiceResult<PostDto[]>>;
    getPublicPosts(input: GetPublicPostsInput): Promise<ServiceResult<PostDto[]>>;
    updatePost(input: UpdatePostInput): Promise<ServiceResult<PostDto>>;
    deletePost(input: DeletePostInput): Promise<ServiceResult<boolean>>;
    likePost(input: LikePostInput): Promise<ServiceResult<boolean>>;
    unlikePost(input: UnlikePostInput): Promise<ServiceResult<boolean>>;
    addTag(input: AddTagInput): Promise<ServiceResult<boolean>>;
    removeTag(input: RemoveTagInput): Promise<ServiceResult<boolean>>;
}