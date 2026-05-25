import { useState } from 'react';

interface CommentActionsProps {
    commentId: number;
    isLiked: boolean;
    likesCount: number;
    isOwner: boolean;
    isAuthenticated: boolean;
    onLike: () => void;
    isRootComment?: boolean;
    onReply: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function CommentActions({
    isLiked,
    likesCount,
    isOwner,
    isAuthenticated,
    onLike,
    onReply,
    onEdit,
    onDelete,
    isRootComment
}: CommentActionsProps) {
    const [isLiking, setIsLiking] = useState(false);

    const handleLikeClick = () => {
        if (!isAuthenticated || isLiking) return;
        setIsLiking(true);
        onLike();
        setTimeout(() => setIsLiking(false), 300);
    };

    return (
        <div className="flex items-center gap-3 mt-2">
            {/* Like - with improved UI */}
            <button
                onClick={handleLikeClick}
                disabled={isLiking || !isAuthenticated}
                className={`flex items-center gap-1.5 text-xs transition-all duration-200 ${
                    isAuthenticated
                        ? isLiked
                            ? 'text-pulse'
                            : 'text-muted-soft hover:text-muted'
                        : 'text-muted-ghost cursor-default'
                } ${isLiking ? 'scale-110' : 'scale-100'}`}
            >
                <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill={isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${isLiking && isLiked ? 'scale-125' : ''}`}
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="font-medium">{likesCount}</span>
            </button>

            {/* Reply - available at all depths */}
            {isAuthenticated && isRootComment && (
                <button
                    onClick={onReply}
                    className="text-xs text-muted-soft hover:text-muted transition-colors flex items-center gap-1.5"
                >
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="9 17 4 12 9 7" />
                        <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                    </svg>
                    Reply
                </button>
            )}

            {/* Edit / Delete — owner only */}
            {isOwner && (
                <>
                    <button
                        onClick={onEdit}
                        className="text-xs text-muted-soft hover:text-muted transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-xs text-muted-soft hover:text-red-400 transition-colors"
                    >
                        Delete
                    </button>
                </>
            )}
        </div>
    );
}
