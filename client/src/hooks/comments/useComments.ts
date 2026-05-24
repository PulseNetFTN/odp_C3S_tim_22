import { useState, useCallback, useRef, useEffect } from 'react';
import type { CommentDto, CreateCommentDto, CommentSortOption } from '../../models/comments/CommentDTO';
import { CommentAPIService } from '../../api_services/comments/CommentAPIService';
import { debounce } from '../../utils/debounce';

interface UseCommentsOptions {
    postId: number;
    token: string | null;
}

interface CommentWithOptimisticLike extends CommentDto {
    _optimisticLike?: boolean;
    _likeCount?: number;
}

export function useComments({ postId, token }: UseCommentsOptions) {
    const [comments, setComments] = useState<CommentWithOptimisticLike[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<CommentSortOption>('newest');
    const [hasMore, setHasMore] = useState(false);
    const [totalComments, setTotalComments] = useState(0);

    const pendingLikesRef = useRef<Set<number>>(new Set());

    const fetchComments = useCallback(async () => {
        if (!postId) {
            setComments([]);
            setError('No post ID provided.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await CommentAPIService.getCommentsByPost(postId);

            if (res.success && res.data) {
                const allComments = Array.isArray(res.data) ? res.data : [];

                // Filter root comments — handle both camelCase (API) and snake_case (legacy)
                const rootComments = allComments.filter((c) => {
                    const pid = c.parentId ?? c.parent_id;
                    return pid === null || pid === undefined;
                });

                setComments(rootComments);
                setTotalComments(rootComments.length);
            } else {
                setError(res.message ?? 'Failed to load comments.');
                setComments([]);
            }
        } catch {
            setError('An error occurred while fetching comments.');
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === 'newest') {
            // Handle both camelCase and snake_case dates
            const dateA = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
            const dateB = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
            return dateB - dateA;
        }
        // most_liked — use optimistic count first, fallback to both naming conventions
        const likesA = a._likeCount ?? a.likesCount ?? a.likes_count ?? 0;
        const likesB = b._likeCount ?? b.likesCount ?? b.likes_count ?? 0;
        return likesB - likesA;
    });

    const addComment = useCallback(async (data: CreateCommentDto): Promise<boolean> => {
        if (!token) return false;
        try {
            const res = await CommentAPIService.createComment(token, data);
            if (res.success) {
                await fetchComments();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error adding comment:', err);
            return false;
        }
    }, [token, fetchComments]);

    const editComment = useCallback(async (id: number, content: string): Promise<boolean> => {
        if (!token) return false;
        try {
            const res = await CommentAPIService.updateComment(token, id, { content });
            if (res.success) {
                await fetchComments();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error editing comment:', err);
            return false;
        }
    }, [token, fetchComments]);

    const removeComment = useCallback(async (id: number): Promise<boolean> => {
        if (!token) return false;
        try {
            const res = await CommentAPIService.deleteComment(token, id);
            if (res.success) {
                await fetchComments();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting comment:', err);
            return false;
        }
    }, [token, fetchComments]);

    const performLikeAPIRef = useRef<(id: number, isLiked: boolean) => Promise<void>>(async () => {});

    performLikeAPIRef.current = async (id: number, isLiked: boolean): Promise<void> => {
        if (!token || pendingLikesRef.current.has(id)) return;
        pendingLikesRef.current.add(id);
        try {
            const res = isLiked
                ? await CommentAPIService.unlikeComment(token, id)
                : await CommentAPIService.likeComment(token, id);

            if (!res.success) {
                // Revert optimistic update
                setComments(prev => prev.map(c =>
                    c.id === id
                        ? { ...c, _optimisticLike: undefined, _likeCount: undefined }
                        : c
                ));
            } else {
                await fetchComments();
            }
        } finally {
            pendingLikesRef.current.delete(id);
        }
    };

    const debouncedLikeAPIRef = useRef(
        debounce((id: number, isLiked: boolean) => {
            return performLikeAPIRef.current?.(id, isLiked);
        }, 300)
    );

    const toggleLike = useCallback((id: number, isLiked: boolean): void => {
        setComments(prev => prev.map(c => {
            if (c.id !== id) return c;
            // Handle both naming conventions for current count
            const currentCount = c._likeCount ?? c.likesCount ?? c.likes_count ?? 0;
            const newCount = isLiked ? currentCount - 1 : currentCount + 1;
            return {
                ...c,
                _optimisticLike: !isLiked,
                _likeCount: newCount,
                isLiked: !isLiked,
                is_liked: !isLiked,
                likesCount: newCount,
                likes_count: newCount,
            };
        }));
        debouncedLikeAPIRef.current(id, isLiked);
    }, []);

    const loadMore = useCallback(() => {
        // Placeholder for future pagination
    }, []);

    return {
        comments: sortedComments,
        loading,
        error,
        sortBy,
        setSortBy,
        addComment,
        editComment,
        removeComment,
        toggleLike,
        fetchComments,
        hasMore,
        totalComments,
        loadMore,
    };
}
