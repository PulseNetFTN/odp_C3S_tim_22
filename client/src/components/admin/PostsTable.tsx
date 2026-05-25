import { useState, useEffect, useRef } from 'react';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { PostDto } from '../../models/posts/PostsDto';

interface Props {
    token: string | null;
}

interface PostCardProps {
    post: PostDto;
    onDelete: (id: number) => Promise<void>;
    isDeleting: boolean;
}

function PostCard({ post, onDelete, isDeleting }: PostCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onDelete(post.id);
        setShowConfirm(false);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(false);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative rounded-xl p-5 transition-all duration-300 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
        >
            {isHovering && !showConfirm && (
                <div
                    className="absolute pointer-events-none transition-opacity duration-150"
                    style={{
                        left: mousePosition.x - 200,
                        top: mousePosition.y - 200,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(108, 99, 255, 0.25) 0%, transparent 70%)',
                        opacity: 0.8,
                    }}
                />
            )}

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-syne font-bold text-white flex-1 pr-2">{post.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                        {post.mediaUrl && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Media
                            </span>
                        )}
                        <button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            title="Delete post"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 mb-2">
                    <span className="text-xs text-muted-ghost flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        @{post.authorUsername}
                    </span>
                    <span className="text-xs text-muted-ghost flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {post.communityName}
                    </span>
                </div>

                <p className="text-sm text-muted line-clamp-2 mb-3">{post.content}</p>

                <div className="flex gap-4 pt-2 border-t border-border-subtle">
                    <span className="text-xs text-muted-ghost flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {post.likeCount} likes
                    </span>
                    <span className="text-xs text-muted-ghost flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.commentCount} comments
                    </span>
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1">
                            {post.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs text-pulse-80">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div 
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
                    style={{ background: 'rgba(0, 0, 0, 0.9)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-center p-4">
                        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-white text-sm mb-3">Delete "{post.title.substring(0, 50)}"?</p>
                        <p className="text-muted-ghost text-xs mb-4">This action cannot be undone.</p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleCancelDelete}
                                className="px-3 py-1 text-xs bg-surface-hover text-white rounded-lg hover:bg-surface"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PostsTable({ token }: Props) {
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        let ignore = false;

        const loadPosts = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const res = await AdminAPIService.getAllPosts(token ?? 'mock-token', 1, 100);
                
                if (!ignore && res.success && res.data) {
                    let postsArray: PostDto[] = [];
                    
                    if (Array.isArray(res.data)) {
                        postsArray = res.data;
                    } else if (res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
                        postsArray = res.data.data;
                    }
                    
                    setPosts(postsArray);
                } else if (!ignore && res.message && !res.data) {
                    setError(res.message);
                    setPosts([]);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                console.error('Failed to load posts:', err);
                setError('Failed to connect to server');
                setPosts([]);
            }
            if (!ignore) setLoading(false);
        };

        loadPosts();

        return () => {
            ignore = true;
        };
    }, [token]);

    const handleDeletePost = async (postId: number) => {
        setDeletingId(postId);
        
        try {
            const res = await AdminAPIService.deletePost(token ?? '', postId);
            
            if (res.success) {
                setPosts(prev => prev.filter(p => p.id !== postId));
                console.log(`Post ${postId} deleted successfully`);
            } else {
                console.error('Failed to delete post:', res.message);
                alert(res.message || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('An error occurred while deleting the post');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-44 bg-surface-hover rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="text-xs text-pulse hover:text-pulse-80"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-syne text-xl font-bold text-white">Posts</h2>
                <p className="text-xs text-muted-ghost">Total: {posts.length}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onDelete={handleDeletePost}
                            isDeleting={deletingId === post.id}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-muted-ghost py-8">
                        No posts found
                    </div>
                )}
            </div>
        </div>
    );
}