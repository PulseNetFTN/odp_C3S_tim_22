import { PostDto } from '../../Domain/DTOs/post/PostDto';
import { Post } from '../../Domain/models/Post';
import { User } from '../../Domain/models/User';
import { Tag } from '../../Domain/models/Tag';
import { Community } from '../../Domain/models/Community';
import { ErrorCode } from '../../Domain/enums/ErrorCode';
import { ICommunityRepository } from '../../Domain/repositories/communities/ICommunityRepository';
import { ICommunityMemberRepository } from '../../Domain/repositories/communities/ICommunityMemberRepository';
import { IPostRepository } from '../../Domain/repositories/post_repository/IPostRepository';
import { IPostLikeRepository } from '../../Domain/repositories/post_repository/IPostLikeRepository';
import { IPostTagRepository } from '../../Domain/repositories/post_repository/IPostTagRepository';
import { IPostCommentRepository } from '../../Domain/repositories/post_repository/IPostCommentRepository';
import { ITagRepository } from '../../Domain/repositories/tags/ITagRepository';
import { IUserRepository } from '../../Domain/repositories/users/IUserRepository';
import { IUserFollowRepository } from '../../Domain/repositories/users/IUserFollowRepository';
import { IPostService } from '../../Domain/services/post/IPostService';
import { ServiceResult } from '../../Domain/types/ServiceResult';
import * as PostInputs from '../../Domain/types/inputs/PostInputs';
import { CommunityRole } from '../../Domain/enums/CommunityRole';
import { UserRole } from '../../Domain/enums/UserRole';

export class PostService implements IPostService {
    public constructor(
        private postRepository: IPostRepository,
        private postLikeRepository: IPostLikeRepository,
        private postTagRepository: IPostTagRepository,
        private postCommentRepository: IPostCommentRepository,
        private userRepository: IUserRepository,
        private userFollowRepository: IUserFollowRepository,
        private communityRepository: ICommunityRepository,
        private communityMemberRepository: ICommunityMemberRepository,
        private tagRepository: ITagRepository
    ) {}

    private async buildPostDto(post: Post, requesterId: number | null): Promise<PostDto> {
        const [authorResult, communityResult, likeCount, commentCount, tagIds, isLiked] = await Promise.all([
            this.userRepository.getById(post.authorId),
            this.communityRepository.getById(post.communityId),
            this.postLikeRepository.getLikeCount(post.id),
            this.postCommentRepository.getCommentCount(post.id),
            this.postTagRepository.getTagIds(post.id),
            requesterId ? this.postLikeRepository.hasLiked(requesterId, post.id) : Promise.resolve(false),
        ]);

        const tags = await this.tagRepository.getByIds(tagIds);

        return new PostDto(
            post.id, post.title, post.content, post.mediaUrl,
            post.communityId, communityResult.ok ? communityResult.data.name : '',
            post.authorId, authorResult.ok ? authorResult.data.username : '',
            authorResult.ok ? authorResult.data.profileImage : null,
            isLiked,
            likeCount, commentCount,
            tags.map((t: Tag) => t.name).filter((s): s is string => s !== null),
            post.createdAt, post.updatedAt
        );
    }

    private async buildPostDtos(posts: Post[], requesterId: number | null): Promise<PostDto[]> {
        if (!posts || posts.length === 0) return [];

        const postIds = posts.map(p => p.id);
        const authorIds = [...new Set(posts.map(p => p.authorId))];
        const communityIds = [...new Set(posts.map(p => p.communityId))];

        const [authors, communities, likeCounts, commentCounts, tagIdMap, likedPostIds] = await Promise.all([
            this.userRepository.getByIds(authorIds),
            this.communityRepository.getByIds(communityIds),
            this.postLikeRepository.getLikeCountBatch(postIds),
            this.postCommentRepository.getCommentCountBatch(postIds),
            this.postTagRepository.getTagIdsBatch(postIds),
            requesterId
                ? this.postLikeRepository.getLikedPostIds(requesterId, postIds)
                : Promise.resolve(new Set<number>()),
        ]);

        const allTagIds = [...new Set([...tagIdMap.values()].flat())];
        const alltags = await this.tagRepository.getByIds(allTagIds);
        const tagMap = new Map(alltags.map((t: Tag) => [t.id, t.name]));
        const authorMap = new Map<number, { username: string; profileImage: string | null }>(
            authors.map((u: User) => [u.id, { username: u.username, profileImage: u.profileImage }])
        );
        const communityMap = new Map(communities.map((c: Community) => [c.id, c.name]));

        return posts.map(post => {
            const author = authorMap.get(post.authorId);
            return new PostDto(
                post.id, post.title, post.content, post.mediaUrl,
                post.communityId, communityMap.get(post.communityId) ?? '',
                post.authorId, author?.username ?? '',
                author?.profileImage ?? null,
                likedPostIds.has(post.id),
                likeCounts.get(post.id) ?? 0,
                commentCounts.get(post.id) ?? 0,
                (tagIdMap.get(post.id) ?? []).map((id: number) => tagMap.get(id) ?? '').filter(Boolean),
                post.createdAt, post.updatedAt
            );
        });
    }

    async createPost(input: PostInputs.CreatePostInput): Promise<ServiceResult<PostDto>> {
        const communityResult = await this.communityRepository.getById(input.communityId);
        if (!communityResult.ok) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const memberResult = await this.communityMemberRepository.getMember(input.authorId, input.communityId);
        if (!memberResult.ok || memberResult.data.status !== 'active') {
            return { success: false, message: 'You must be an active member to post', errorCode: ErrorCode.FORBIDDEN };
        }

        const postResult = await this.postRepository.create(
            new Post(0, input.title, input.content, input.mediaUrl, input.communityId, input.authorId)
        );
        if (!postResult.ok) {
            return { success: false, message: 'Failed to create post', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const post = postResult.data;

        if (input.tagIds.length > 0) {
            const tagsAdded = await this.postTagRepository.addTags(post.id, input.tagIds);
            if (!tagsAdded) {
                return { success: false, message: 'Failed to add tags to post', errorCode: ErrorCode.INTERNAL_ERROR };
            }
        }

        const dto = await this.buildPostDto(post, input.authorId);
        return { success: true, data: dto };
    }

    async getPostById(input: PostInputs.GetPostInput): Promise<ServiceResult<PostDto>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const dto = await this.buildPostDto(postResult.data, input.requesterId);
        return { success: true, data: dto };
    }

    async getCommunityPosts(input: PostInputs.GetCommunityPostsInput): Promise<ServiceResult<PostDto[]>> {
        const communityResult = await this.communityRepository.getById(input.communityId);
        if (!communityResult.ok) {
            return { success: false, message: 'Community not found', errorCode: ErrorCode.NOT_FOUND };
        }

        const posts = await this.postRepository.getByCommunityId(input.communityId);
        const dtos = await this.buildPostDtos(posts, input.requesterId);

        if (input.sort === 'popular') dtos.sort((a, b) => b.likeCount - a.likeCount);
        else if (input.sort === 'commented') dtos.sort((a, b) => b.commentCount - a.commentCount);

        return { success: true, data: dtos };
    }

    async getFeed(input: PostInputs.GetFeedInput): Promise<ServiceResult<PostDto[]>> {
        const communities = await this.communityRepository.getByUserId(input.userId);
        const communityIds = communities?.map((c: Community) => c.id) ?? [];

        const followingIds = await this.userFollowRepository.getFollowingIds(input.userId);

        const [communityPostIds, followedPostIds] = await Promise.all([
            this.postRepository.getCommunityPostIds(communityIds),
            this.postRepository.getFollowedAuthorPostIds(followingIds),
        ]);

        const uniqueIds = [...new Set([...communityPostIds, ...followedPostIds])];
        if (uniqueIds.length === 0) return { success: true, data: [] };

        const posts = await this.postRepository.getByIds(uniqueIds);
        posts.sort((a: Post, b: Post) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });

        const dtos = await this.buildPostDtos(posts.slice(0, 50), input.userId);
        return { success: true, data: dtos };
    }

    async getPublicPosts(input: PostInputs.GetPublicPostsInput): Promise<ServiceResult<PostDto[]>> {
        const posts = await this.postRepository.getPublicPosts(input.limit);
        const dtos = await this.buildPostDtos(posts, input.requesterId);
        return { success: true, data: dtos };
    }

    async getPostsByUser(input: PostInputs.GetPostsByUserInput): Promise<ServiceResult<PostDto[]>> {
        const posts = await this.postRepository.getByAuthorId(input.userId);
        const dtos = await this.buildPostDtos(posts, input.requesterId ?? null);
        return { success: true, data: dtos };
    }

    async updatePost(input: PostInputs.UpdatePostInput): Promise<ServiceResult<PostDto>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const post = postResult.data;

        const isAdmin = input.requesterRole === UserRole.Admin;
        const isAuthor = post.authorId === input.requesterId;

        if (!isAdmin && !isAuthor) {
            const memberResult = await this.communityMemberRepository.getMember(input.requesterId, post.communityId);
            const isModerator = memberResult.ok && memberResult.data.role === CommunityRole.Moderator;
            if (!isModerator) {
                return { success: false, message: 'Not authorized to update this post', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const updateResult = await this.postRepository.update(
            new Post(input.postId, input.title, input.content, input.mediaUrl, post.communityId, post.authorId)
        );
        if (!updateResult.ok) {
            return { success: false, message: 'Update failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }

        const dto = await this.buildPostDto(updateResult.data, input.requesterId);
        return { success: true, data: dto };
    }

    async deletePost(input: PostInputs.DeletePostInput): Promise<ServiceResult<boolean>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const post = postResult.data;

        const isAdmin = input.requesterRole === UserRole.Admin;
        const isAuthor = post.authorId === input.requesterId;

        if (!isAdmin && !isAuthor) {
            const memberResult = await this.communityMemberRepository.getMember(input.requesterId, post.communityId);
            const isModerator = memberResult.ok && memberResult.data.role === CommunityRole.Moderator;
            if (!isModerator) {
                return { success: false, message: 'Not authorized to delete this post', errorCode: ErrorCode.FORBIDDEN };
            }
        }

        const result = await this.postRepository.delete(input.postId);
        if (!result) {
            return { success: false, message: 'Delete failed', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async likePost(input: PostInputs.LikePostInput): Promise<ServiceResult<boolean>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        if (postResult.data.authorId === input.userId) {
            return { success: false, message: 'You cannot like your own post', errorCode: ErrorCode.VALIDATION_ERROR };
        }
        const alreadyLiked = await this.postLikeRepository.hasLiked(input.userId, input.postId);
        if (alreadyLiked) {
            return { success: false, message: 'You have already liked this post', errorCode: ErrorCode.ALREADY_EXISTS };
        }
        const result = await this.postLikeRepository.addLike(input.userId, input.postId);
        if (!result) {
            return { success: false, message: 'Failed to like post', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async unlikePost(input: PostInputs.UnlikePostInput): Promise<ServiceResult<boolean>> {
        const hasLiked = await this.postLikeRepository.hasLiked(input.userId, input.postId);
        if (!hasLiked) {
            return { success: false, message: 'You have not liked this post', errorCode: ErrorCode.NOT_FOUND };
        }
        const result = await this.postLikeRepository.removeLike(input.userId, input.postId);
        if (!result) {
            return { success: false, message: 'Failed to unlike post', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async addTag(input: PostInputs.AddTagInput): Promise<ServiceResult<boolean>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        if (postResult.data.authorId !== input.requesterId) {
            return { success: false, message: 'Only the author can add tags', errorCode: ErrorCode.FORBIDDEN };
        }
        const tagResult = await this.tagRepository.getById(input.tagId);
        if (!tagResult.ok) {
            return { success: false, message: 'Tag not found', errorCode: ErrorCode.NOT_FOUND };
        }
        const result = await this.postTagRepository.addTag(input.postId, input.tagId);
        if (!result) {
            return { success: false, message: 'Failed to add tag', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }

    async removeTag(input: PostInputs.RemoveTagInput): Promise<ServiceResult<boolean>> {
        const postResult = await this.postRepository.getById(input.postId);
        if (!postResult.ok) {
            return { success: false, message: 'Post not found', errorCode: ErrorCode.NOT_FOUND };
        }
        if (postResult.data.authorId !== input.requesterId) {
            return { success: false, message: 'Only the author can remove tags', errorCode: ErrorCode.FORBIDDEN };
        }
        const result = await this.postTagRepository.removeTag(input.postId, input.tagId);
        if (!result) {
            return { success: false, message: 'Failed to remove tag', errorCode: ErrorCode.INTERNAL_ERROR };
        }
        return { success: true, data: true };
    }
}