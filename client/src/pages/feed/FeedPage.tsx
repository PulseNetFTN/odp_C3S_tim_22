import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import PostCard from '../../components/post/Postcard';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { postApi } from '../../api_services/post/PostAPIService';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import type { PostDto } from '../../models/posts/PostsDto';
import { Loader2 } from 'lucide-react';

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<PostDto[]>([]);
    const [communities, setCommunities] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let ignore = false;

        async function load() {
            setLoading(true);
            setError('');

            const [feedData, communityData] = await Promise.all([
                user ? postApi.getFeed() : postApi.getPublicPosts(),
                user ? communityApi.getMine() : Promise.resolve(null),
            ]);

            if (ignore) return;

            let postData = feedData;
            if (user && feedData.success && (feedData.data?.length ?? 0) === 0) {
                postData = await postApi.getPublicPosts();
            }

            if (postData.success) {
                setPosts(postData.data ?? []);
            } else {
                setError(postData.message || 'Failed to load posts');
            }

            if (communityData?.success && communityData.data) {
                setCommunities(communityData.data.map(c => ({ id: c.id, name: c.name })));                
            }

           setLoading(false);
        }

        load();

        return () => { ignore = true; };
    }, [user, retryCount]);


    return (
        <AppLayout communities={communities}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between mb-2">
                    <h1
                        className="text-lg font-bold text-white/90"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                        {user ? 'Your Feed' : 'Popular Posts'}
                    </h1>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} strokeWidth={1.5} className="text-white/30 animate-spin" />
                    </div>
                )}

                {!loading && error && (
                    <div
                        className="rounded-lg px-4 py-6 text-center text-sm text-white/50"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <p>{error}</p>
                        <button
                            onClick={() => setRetryCount(c => c + 1)}
                            className="mt-3 text-xs text-pulse hover:underline"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div
                        className="rounded-lg px-4 py-12 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <p className="text-sm text-white/40 mb-2">
                            {user
                                ? 'No posts yet. Join some communities or follow users to see their posts here.'
                                : 'No public posts yet. Be the first to post!'}
                        </p>
                    </div>
                )}

                {!loading && posts.map(post => (
                    <PostCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        content={post.content}
                        mediaUrl={post.mediaUrl}
                        communityId={post.communityId}
                        communityName={post.communityName}
                        authorId={post.authorId}
                        authorUsername={post.authorUsername}
                        authorProfileImage={post.authorProfileImage}
                        isLiked={post.isLiked}
                        likeCount={post.likeCount}
                        commentCount={post.commentCount}
                        tags={post.tags}
                        createdAt={post.createdAt}
                    />
                ))}
            </div>
        </AppLayout>
    );
}