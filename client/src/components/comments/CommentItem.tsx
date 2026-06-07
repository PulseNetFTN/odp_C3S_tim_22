import { useState } from 'react';
import type { CommentDto } from '../../models/comments/CommentDTO';
import CommentActions from './CommentActions';
import CommentForm from './CommentEditForm';
import CollapsibleReplies from './CollapsibleReplies';

interface CommentItemProps {
    comment: CommentDto;
    depth?: number;
    replyCount?: number;
    currentUserId?: number | null;
    isAuthenticated: boolean;
    onReply: (parentId: number, content: string) => Promise<boolean>;
    onEdit: (id: number, content: string) => Promise<boolean>;
    onDelete: (id: number) => Promise<boolean>;
    onLike: (id: number, isLiked: boolean) => void;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return 'recent';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(username: string): string {
    if (!username) return '?';
    return username.slice(0, 2).toUpperCase();
}

export default function CommentItem({
    comment,
    depth = 0,
    replyCount = 0,
    currentUserId,
    isAuthenticated,
    onReply,
    onEdit,
    onDelete,
    onLike,
}: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const authorId   = comment.authorId ?? 0;
    const createdAt  = comment.createdAt ?? '';
    const updatedAt  = comment.updatedAt;
    const isDeleted  = !!comment.isDeleted;
    const likesCount = comment.likesCount ?? 0;
    const isLiked    = comment.isLiked ?? false;
    const totalReplies  = replyCount || (comment.replies?.length ?? 0);

    const authorUsername = comment.authorUsername ?? `user_${authorId}`;

    const isOwner = isAuthenticated && currentUserId === authorId;

    const handleEditSave = async () => {
        const trimmed = editContent.trim();
        if (!trimmed) { setEditError('Content cannot be empty.'); return; }
        if (trimmed.length > 2000) { setEditError('Max 2000 characters.'); return; }
        setEditError(null);
        setEditLoading(true);
        const ok = await onEdit(comment.id, trimmed);
        setEditLoading(false);
        if (ok) setEditMode(false);
        else setEditError('Failed to save. Try again.');
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        await onDelete(comment.id);
        setDeleteLoading(false);
        setShowDeleteConfirm(false);
    };

    return (
        <div className={depth > 0 ? 'pl-4 border-l border-white/5' : ''}>
            <div className="flex gap-3 group">
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-pulse-50 flex items-center justify-center text-pulse text-xs font-medium font-syne">
                        {getInitials(authorUsername)}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <a href={`/profile/${authorId}`} className="text-sm font-medium text-white hover:underline">
                            @{authorUsername}
                        </a>
                        <span className="text-xs text-muted-ghost">
                            {formatDate(createdAt)}
                        </span>
                        {updatedAt && updatedAt !== createdAt && !isDeleted && (
                            <span className="text-xs text-muted-ghost italic">(edited)</span>
                        )}
                    </div>

                    {/* Content */}
                    {isDeleted ? (
                        <p className="text-sm text-muted-ghost italic mt-1">[comment deleted]</p>
                    ) : editMode ? (
                        <div className="mt-2 space-y-2">
                            <textarea
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={3}
                                maxLength={2000}
                                autoFocus
                                className="w-full bg-surface-hover border border-white/6 rounded text-muted text-sm px-3 py-2 resize-none focus:outline-none focus:border-pulse/40 transition-colors"
                            />
                            {editError && <p className="text-xs text-red-400">{editError}</p>}
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => { setEditMode(false); setEditContent(comment.content); setEditError(null); }}
                                    className="text-xs text-muted-soft hover:text-muted transition-colors px-3 py-1.5 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEditSave}
                                    disabled={editLoading}
                                    className="text-xs bg-pulse text-white px-4 py-1.5 rounded font-medium hover:bg-pulse-80 transition-colors disabled:opacity-40"
                                >
                                    {editLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted mt-1 leading-relaxed break-words">
                            {comment.content}
                        </p>
                    )}

                    {/* Actions */}
                    {!isDeleted && !editMode && (
                        <CommentActions
                            commentId={comment.id}
                            isLiked={isLiked}
                            likesCount={likesCount}
                            isOwner={isOwner}
                            isAuthenticated={isAuthenticated}
                            onLike={() => onLike(comment.id, isLiked)}
                            isRootComment={comment.parentId === null}
                            onReply={() => setShowReplyForm(v => !v)}
                            onEdit={() => { setEditMode(true); setEditContent(comment.content); }}
                            onDelete={() => setShowDeleteConfirm(true)}
                        />
                    )}

                    {/* Reply form */}
                    {showReplyForm && (
                        <div className="mt-3">
                            <CommentForm
                                autoFocus
                                placeholder="Write a reply..."
                                submitLabel="Reply"
                                onCancel={() => setShowReplyForm(false)}
                                onSubmit={content => onReply(comment.id, content)}
                            />
                        </div>
                    )}

                    {/* Delete confirm */}
                    {showDeleteConfirm && (
                        <div className="mt-3 p-3 bg-surface-hover border border-white/6 rounded space-y-2">
                            <p className="text-sm text-muted">Delete this comment? Replies will remain.</p>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="text-xs text-muted-soft hover:text-muted transition-colors px-3 py-1.5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    className="text-xs bg-red-500/80 text-white px-4 py-1.5 rounded hover:bg-red-500 transition-colors disabled:opacity-40"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Replies */}
            {totalReplies > 0 && (
                <CollapsibleReplies
                    parentComment={comment}
                    replyCount={totalReplies}
                    currentUserId={currentUserId}
                    isAuthenticated={isAuthenticated}
                    depth={depth}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onLike={onLike}
                />
            )}
        </div>
    );
}
