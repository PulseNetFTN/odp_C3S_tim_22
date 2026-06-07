import { Post } from '../../models/Post';
import { RepositoryResult } from '../../types/RepositoryResult';

export interface IPostRepository {
    create(post: Post): Promise<RepositoryResult<Post>>;
    getById(id: number): Promise<RepositoryResult<Post>>;
    getByIds(ids: number[]): Promise<Post[]>;
    getByCommunityId(communityId: number): Promise<Post[]>;
    getByAuthorId(authorId: number): Promise<Post[]>;
    getPostCountByAuthor(authorId: number): Promise<number>;
    getCommunityPostIds(communityIds: number[]): Promise<number[]>;
    getFollowedAuthorPostIds(authorIds: number[]): Promise<number[]>;
    getPublicPosts(limit: number): Promise<Post[]>;
    update(post: Post): Promise<RepositoryResult<Post>>;
    delete(id: number): Promise<boolean>;
}
