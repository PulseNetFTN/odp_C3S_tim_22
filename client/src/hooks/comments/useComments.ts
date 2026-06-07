import { useState, useCallback, useEffect, useRef } from 'react';
import type { CommentDto, CreateCommentDto, CommentSortOption } from '../../models/comments/CommentDTO';
import { CommentAPIService } from '../../api_services/comments/CommentAPIService';

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
    const hasMore = false;
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
                const rootComments = allComments.filter(c => !c.parentId);
                
                setComments(rootComments);
                const total = allComments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);
                setTotalComments(total);
            } else {
                setError(res.message ?? 'Failed to load comments.');
                setComments([]);
            }
        } catch (err) {
            console.log('💥 [fetchComments] Error fetching comments:', err);
            setError('An error occurred while fetching comments.');
            setComments([]);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const sortedComments = [...comments].sort((a, b) => {
        if (sortBy === 'newest') {
            const dateA = new Date(a.createdAt ?? 0).getTime();
            const dateB = new Date(b.createdAt ?? 0).getTime();
            return dateB - dateA;
        }
        const likesA = a._likeCount ?? a.likesCount ?? 0;
        const likesB = b._likeCount ?? b.likesCount ?? 0;
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

    const toggleLike = useCallback((id: number, isCurrentlyLiked: boolean) => {
        
        setComments(prev => prev.map(comment => {
            if (comment.id !== id) return comment;
            
            const currentLikes = comment._likeCount ?? comment.likesCount ?? 0;
            const newLikes = isCurrentlyLiked ? currentLikes - 1 : currentLikes + 1;
            
            return {
                ...comment,
                _likeCount: newLikes,
                _optimisticLike: true,
                likesCount: newLikes,
                isLiked: !isCurrentlyLiked,
            };
        }));
        
        const performLike = async () => {
            if (!token) return;
            
            if (pendingLikesRef.current.has(id)) return;
            pendingLikesRef.current.add(id);
            
            const revertLike = () => {
                setComments(prev => prev.map(comment => {
                    if (comment.id !== id) return comment;
                    const current = comment._likeCount ?? comment.likesCount ?? 0;
                    return {
                        ...comment,
                        _likeCount: isCurrentlyLiked ? current + 1 : current - 1,
                        likesCount: isCurrentlyLiked ? current + 1 : current - 1,
                        isLiked: isCurrentlyLiked,
                        _optimisticLike: false,
                    };
                }));
            };

            try {
                const res = isCurrentlyLiked
                    ? await CommentAPIService.unlikeComment(token, id)
                    : await CommentAPIService.likeComment(token, id);

                if (!res.success) {
                    revertLike();
                }
            } catch (error) {
                console.error('💥 [toggleLike] Error:', error);
                revertLike();
            } finally {
                pendingLikesRef.current.delete(id);
            }
        };
        
        const timeoutId = setTimeout(() => {
            performLike();
        }, 300);
        
        return () => clearTimeout(timeoutId);
    }, [token]);

    const loadMore = useCallback(() => {}, []);

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