import type { CommentDto } from '../../models/comments/CommentDTO';
import CommentItem from './CommentItem';

interface CommentListProps {
    comments: CommentDto[];
    currentUserId?: number | null;
    isAuthenticated: boolean;
    onReply: (parentId: number, content: string) => Promise<boolean>;
    onEdit: (id: number, content: string) => Promise<boolean>;
    onDelete: (id: number) => Promise<boolean>;
    onLike: (id: number, isLiked: boolean) => void;
}

export default function CommentList({
    comments,
    currentUserId,
    isAuthenticated,
    onReply,
    onEdit,
    onDelete,
    onLike,
}: CommentListProps) {
    if (comments.length === 0) {
        return (
            <div className="py-10 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-muted-ghost/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="text-muted-ghost text-sm">No comments yet. Be the first to comment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {comments.map(comment => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    depth={0}
                    replyCount={comment.replies?.length ?? 0}
                    currentUserId={currentUserId}
                    isAuthenticated={isAuthenticated}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLike={onLike}
                />
            ))}
        </div>
    );
}
