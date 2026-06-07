    import { useEffect, useState } from 'react';
    import { useParams, Link, useNavigate } from 'react-router-dom';
    import {
        Settings, Users, Globe, Lock, LogOut, UserPlus,
        Loader2, Plus, User, Calendar, AlertTriangle,
    } from 'lucide-react';
    import AppLayout from '../../components/layout/AppLayout';
    import PostCard from '../../components/post/Postcard';
    import EditCommunityModal from '../../components/community/EditCommunityModal';
    import { useAuth } from '../../hooks/auth/useAuthHook';
    import { communityApi } from '../../api_services/community/CommunityAPIService';
    import { postApi } from '../../api_services/post/PostAPIService';
    import type { CommunityDto } from '../../models/communities/CommunityDto';
    import type { PostDto } from '../../models/posts/PostsDto';

    type SortMode = 'newest' | 'popular' | 'comments';

    export default function CommunityPage() {
        const { id } = useParams<{ id: string }>();
        const { user } = useAuth();
        const navigate = useNavigate();

        const [community, setCommunity] = useState<CommunityDto | null>(null);
        const [posts, setPosts] = useState<PostDto[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');
        const [sort, setSort] = useState<SortMode>('newest');

        // Membership state
        const [isMember, setIsMember] = useState(false);
        const [isModerator, setIsModerator] = useState(false);
        const [joinLoading, setJoinLoading] = useState(false);

        // Edit modal
        const [editOpen, setEditOpen] = useState(false);

        // Sidebar communities for AppLayout
        const [myCommunities, setMyCommunities] = useState<{ id: number; name: string }[]>([]);

        const communityId = Number(id);

        useEffect(() => {
            let ignore = false;

            async function load() {
                setLoading(true);
                setError('');

                try {
                    const [communityRes, postsRes] = await Promise.all([
                        communityApi.getById(communityId),
                        postApi.getCommunityPosts(communityId, sort),
                    ]);

                    if (ignore) return;

                    if (communityRes.success && communityRes.data) {
                        setCommunity(communityRes.data);
                    } else {
                        setError('Community not found');
                    }

                    if (postsRes.success) {
                        setPosts(postsRes.data ?? []);
                    }

                    // Check membership
                    if (user) {
                        const mineRes = await communityApi.getMine();
                        if (!ignore && mineRes.success && mineRes.data) {
                            const mine = mineRes.data;
                            setMyCommunities(mine.map(c => ({ id: c.id, name: c.name })));

                            const membership = mine.find(c => c.id === communityId);
                            setIsMember(!!membership);
                            // Creator is moderator
                            if (communityRes.data) {
                                setIsModerator(communityRes.data.creatorId === user.id);
                            }
                        }
                    }
                } catch {
                    if (!ignore) setError('Failed to load community');
                } finally {
                    if (!ignore) setLoading(false);
                }
            }

            load();
            return () => { ignore = true; };
        }, [communityId, user, sort]);

        async function handleJoin() {
            if (!user || joinLoading) return;
            setJoinLoading(true);
            try {
                const res = await communityApi.join(communityId);
                if (res.success) {
                    setIsMember(true);
                    setCommunity(prev => prev ? { ...prev, memberCount: prev.memberCount + 1 } : prev);
                }
            } catch { /* silent */ }
            finally { setJoinLoading(false); }
        }

        async function handleLeave() {
            if (!user || joinLoading) return;
            setJoinLoading(true);
            try {
                const res = await communityApi.leave(communityId);
                if (res.success) {
                    setIsMember(false);
                    setCommunity(prev => prev ? { ...prev, memberCount: Math.max(0, prev.memberCount - 1) } : prev);
                }
            } catch { /* silent */ }
            finally { setJoinLoading(false); }
        }

        function handleCommunityUpdated(updated: CommunityDto) {
            setCommunity(updated);
        }

        // Sort buttons config
        const sortOptions: { key: SortMode; label: string }[] = [
            { key: 'newest', label: 'New' },
            { key: 'popular', label: 'Top' },
            { key: 'comments', label: 'Hot' },
        ];

        if (loading) {
            return (
                <AppLayout communities={myCommunities}>
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={24} strokeWidth={1.5} className="text-white/30 animate-spin" />
                    </div>
                </AppLayout>
            );
        }

        if (error || !community) {
            return (
                <AppLayout communities={myCommunities}>
                    <div
                        className="rounded-lg px-6 py-12 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <AlertTriangle size={32} strokeWidth={1.5} className="text-white/20 mx-auto mb-3" />
                        <p className="text-sm text-white/40">{error || 'Community not found'}</p>
                        <Link to="/explore" className="text-xs text-pulse hover:underline mt-3 inline-block no-underline">
                            Browse communities
                        </Link>
                    </div>
                </AppLayout>
            );
        }

        return (
            <AppLayout communities={myCommunities}>
                {/* Community Header / Banner */}
                <div
                    className="rounded-xl overflow-hidden mb-4"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Banner gradient */}
                    <div
                        className="h-28 sm:h-36 relative"
                        style={{
                            background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(108,99,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
                        }}
                    >
                        {/* Settings gear moderator only */}
                        {isModerator && (
                            <button
                                onClick={() => setEditOpen(true)}
                                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ background: 'rgba(0,0,0,0.3)', border: 'none', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
                            >
                                <Settings size={16} strokeWidth={1.5} className="text-white/70" />
                            </button>
                        )}
                    </div>

                    {/* Info section */}
                    <div className="px-5 pb-5 -mt-10 relative">
                        <div className="flex items-end gap-4 mb-4">
                            {/* Avatar */}
                            <div
                                className="w-20 h-20 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                                style={{
                                    background: community.avatar ? 'transparent' : 'rgba(108,99,255,0.15)',
                                    border: '3px solid rgba(14, 14, 22, 1)',
                                }}
                            >
                                {community.avatar ? (
                                    <img src={community.avatar} alt={community.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span
                                        className="text-2xl font-black text-white/60"
                                        style={{ fontFamily: "'Syne', sans-serif" }}
                                    >
                                        {community.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* Join / Leave right-aligned */}
                            <div className="ml-auto mb-1">
                                {user && !isModerator && (
                                    isMember ? (
                                        <button
                                            onClick={handleLeave}
                                            disabled={joinLoading}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <LogOut size={13} strokeWidth={1.5} />
                                            Leave
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleJoin}
                                            disabled={joinLoading}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all"
                                            style={{
                                                background: 'var(--color-pulse, #6c63ff)',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {joinLoading ? (
                                                <Loader2 size={13} strokeWidth={2} className="animate-spin" />
                                            ) : (
                                                <UserPlus size={13} strokeWidth={1.5} />
                                            )}
                                            {community.type === 'private' ? 'Request to Join' : 'Join'}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Name & meta */}
                        <h1 className="text-xl font-bold text-white/95 mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                            c/{community.name}
                        </h1>

                        {community.description && (
                            <p className="text-sm text-white/45 leading-relaxed mb-3 max-w-[600px]">
                                {community.description}
                            </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-white/35">
                            <div className="flex items-center gap-1.5">
                                {community.type === 'public' ? (
                                    <Globe size={12} strokeWidth={1.5} />
                                ) : (
                                    <Lock size={12} strokeWidth={1.5} />
                                )}
                                <span className="capitalize">{community.type}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Users size={12} strokeWidth={1.5} />
                                <span>{community.memberCount} member{community.memberCount !== 1 ? 's' : ''}</span>
                            </div>
                            {community.createdAt && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={12} strokeWidth={1.5} />
                                    <span>Created {new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action bar: sort + create post */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                        {sortOptions.map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setSort(opt.key)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                                style={{
                                    background: sort === opt.key ? 'rgba(108,99,255,0.12)' : 'transparent',
                                    color: sort === opt.key ? '#6c63ff' : 'rgba(255,255,255,0.4)',
                                    border: sort === opt.key ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {user && isMember && (
                        <button
                            onClick={() => navigate(`/communities/${communityId}/create-post`)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
                            style={{
                                background: 'var(--color-pulse, #6c63ff)',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <Plus size={14} strokeWidth={2} />
                            Create Post
                        </button>
                    )}
                </div>

                {/* Posts list */}
                <div className="flex flex-col gap-3">
                    {posts.length === 0 && (
                        <div
                            className="rounded-lg px-4 py-12 text-center"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <User size={28} strokeWidth={1.5} className="text-white/15 mx-auto mb-2" />
                            <p className="text-sm text-white/35">
                                No posts yet.{' '}
                                {user && isMember ? 'Be the first to share something!' : 'Join to start posting.'}
                            </p>
                        </div>
                    )}

                    {posts.map(post => (
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

                {/* Edit modal */}
                {community && (
                    <EditCommunityModal
                        isOpen={editOpen}
                        community={community}
                        onClose={() => setEditOpen(false)}
                        onUpdated={handleCommunityUpdated}
                        onDeleted={() => navigate('/feed')}
                    />
                )}
            </AppLayout>
        );
    }
