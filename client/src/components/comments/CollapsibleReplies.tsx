import { useState, useEffect } from 'react';
import type { CommentDto } from '../../models/comments/CommentDTO';
import CommentItem from './CommentItem';
import { CommentAPIService } from '../../api_services/comments/CommentAPIService';

interface CollapsibleRepliesProps {
    parentComment: CommentDto;
    replyCount: number;
    currentUserId?: number | null;
    isAuthenticated: boolean;
    depth: number;
    onReply: (parentId: number, content: string) => Promise<boolean>;
    onEdit: (id: number, content: string) => Promise<boolean>;
    onDelete: (id: number) => Promise<boolean>;
    onLike: (id: number, isLiked: boolean) => void;
}

export default function CollapsibleReplies({
    parentComment,
    replyCount,
    currentUserId,
    isAuthenticated,
    depth,
    onReply,
    onEdit,
    onDelete,
    onLike,
}: CollapsibleRepliesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [replies, setReplies] = useState<CommentDto[]>(parentComment.replies ?? []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReplyLike = (id: number, isCurrentlyLiked: boolean) => {
        setReplies(prev => prev.map(reply => {
            if (reply.id !== id) return reply;
            const currentLikes = reply.likesCount ?? 0;
            return {
                ...reply,
                likesCount: isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1,
                isLiked: !isCurrentlyLiked,
            };
        }));
        onLike(id, isCurrentlyLiked);
    };

    // Keep local replies in sync when parent refetches (e.g. after adding a reply)
    useEffect(() => {
        if (parentComment.replies) {
            setReplies(parentComment.replies);
        }
    }, [parentComment.replies]);

    // Fetch from API when expanded if no replies are loaded yet (fallback)
    useEffect(() => {
        if (!isExpanded || replies.length > 0) return;

        const fetchReplies = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await CommentAPIService.getRepliesByComment(parentComment.id);
                if (res.success && res.data) {
                    setReplies(Array.isArray(res.data) ? res.data : []);
                } else {
                    setError(res.message ?? 'Failed to load replies.');
                }
            } catch {
                setError('Failed to load replies.');
            } finally {
                setLoading(false);
            }
        };

        fetchReplies();
    }, [isExpanded, replies.length, parentComment.id]);

    if (replyCount === 0) return null;

    return (
        <div className="mt-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-xs text-pulse hover:text-pulse-80 transition-colors font-medium"
            >
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {isExpanded ? 'Hide' : 'Show'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-pulse/20">
                    {loading && (
                        <div className="py-4 text-center">
                            <div className="inline-block text-xs text-muted-ghost">Loading replies...</div>
                        </div>
                    )}

                    {error && (
                        <div className="py-3 px-3 bg-surface-hover border border-red-500/20 rounded text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    {replies.length > 0 && !loading && (
                        <div className="space-y-4">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    depth={depth + 1}
                                    currentUserId={currentUserId}
                                    isAuthenticated={isAuthenticated}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onLike={handleReplyLike}
                                    replyCount={reply.replies?.length ?? 0}
                                />
                            ))}
                        </div>
                    )}

                    {replies.length === 0 && !loading && !error && (
                        <div className="py-3 text-xs text-muted-ghost text-center">
                            No replies yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
