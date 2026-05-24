import { useComments } from '../../hooks/comments/useComments';
import type { CommentSortOption } from '../../models/comments/CommentDTO';
import CommentList from './CommentList';
import CommentForm from './CommentEditForm';
import CommentSkeleton from './CommentSkeleton';

interface CommentSectionProps {
    postId: number;
    token: string | null;
    currentUserId?: number | null;
    isAuthenticated: boolean;
    onLoginRequired?: () => void;
}

const SORT_OPTIONS: { value: CommentSortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'most_liked', label: 'Most Liked' },
];

export default function CommentSection({
    postId,
    token,
    currentUserId,
    isAuthenticated,
    onLoginRequired,
}: CommentSectionProps) {
    const {
        comments,
        loading,
        error,
        sortBy,
        setSortBy,
        addComment,
        editComment,
        removeComment,
        toggleLike,
        fetchComments,
    } = useComments({ postId, token });

    const handleAddRoot = async (content: string): Promise<boolean> => {
        if (!isAuthenticated) { onLoginRequired?.(); return false; }
        return addComment({ post_id: postId, content, parent_id: null });
    };

    const handleReply = async (parentId: number, content: string): Promise<boolean> => {
        if (!isAuthenticated) { onLoginRequired?.(); return false; }
        return addComment({ post_id: postId, content, parent_id: parentId });
    };

    return (
        <section className="mt-8 border-t border-white/5 pt-8">
            {/* Header with Sort Options */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-syne font-bold text-muted-strong tracking-heading">
                    Comments
                    {!loading && !error && (
                        <span className="ml-2 text-sm font-dm font-normal text-muted-ghost">
                            ({comments.length})
                        </span>
                    )}
                </h3>

                {/* Sort - Sticky on scroll */}
                <div className="flex items-center gap-1 sticky top-0 z-20">
                    {SORT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setSortBy(opt.value)}
                            className={`text-xs px-3 py-1.5 rounded transition-all font-dm font-medium ${
                                sortBy === opt.value
                                    ? 'bg-pulse/20 text-pulse border border-pulse/40'
                                    : 'text-muted-ghost hover:text-muted border border-transparent hover:border-white/10'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Comment Form - Sticky */}
            {isAuthenticated ? (
                <div className="mb-8 sticky top-12 z-20 bg-surface-base/95 backdrop-blur-md border border-white/5 rounded-lg p-4 shadow-lg">
                    <CommentForm
                        onSubmit={handleAddRoot}
                        placeholder="Share your thoughts..."
                        submitLabel="Comment"
                    />
                </div>
            ) : (
                <div className="mb-8 p-4 bg-surface-hover border border-white/4 rounded text-center">
                    <p className="text-sm text-muted-ghost">
                        <button
                            onClick={onLoginRequired}
                            className="text-pulse hover:text-pulse-80 transition-colors underline underline-offset-2 font-medium"
                        >
                            Sign in
                        </button>{' '}
                        to join the conversation.
                    </p>
                </div>
            )}

            {/* Loading State */}
            {loading && <CommentSkeleton />}

            {/* Error State */}
            {error && !loading && (
                <div className="py-6 text-center space-y-2">
                    <p className="text-sm text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => fetchComments()}
                        className="text-xs text-pulse hover:text-pulse-80 transition-colors underline underline-offset-2 font-medium"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Comments List */}
            {!loading && !error && (
                <CommentList
                    comments={comments}
                    currentUserId={currentUserId}
                    isAuthenticated={isAuthenticated}
                    onReply={handleReply}
                    onEdit={editComment}
                    onDelete={removeComment}
                    onLike={toggleLike}
                />
            )}
        </section>
    );
}
