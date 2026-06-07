import { Comment } from '../../models/Comment';
import { RepositoryResult } from '../../types/RepositoryResult';

export interface ICommentReadWriteRepository {
    getById(id: number): Promise<RepositoryResult<Comment>>;
    getByPost(postId: number): Promise<Comment[]>;
    getByAuthor(authorId: number): Promise<Comment[]>;
    getCommentCountByAuthor(authorId: number): Promise<number>;
    create(comment: Comment): Promise<RepositoryResult<Comment>>;
    update(id: number, content: string): Promise<boolean>;
    softDelete(id: number): Promise<boolean>;
    setFlag(id: number, isFlagged: boolean): Promise<boolean>;
}
