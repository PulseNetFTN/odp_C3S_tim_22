import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { useParticles } from '../../hooks/other/useParticles';
import { UserProfileAPIService } from '../../api_services/users/UserProfileAPIService';
import type { UserProfileDto } from '../../models/users/UserDto';
import type { PostDto } from '../../models/posts/PostsDto';
import type { CommentDto } from '../../models/comments/CommentDTO';
import ProfileHeader from '../../components/profile/ProfileHeader';
import FollowersList from '../../components/profile/FollowersList';
import FollowingList from '../../components/profile/FollowingList';
import { ArrowLeft, Edit2, Save, X, FileText, MessageSquare, Tag } from 'lucide-react';
import UserTagCloud from '../../components/profile/UserTagCloud';

export default function ProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        profileImage: null as string | null,
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [saving, setSaving] = useState(false);
    const [showFollowersList, setShowFollowersList] = useState(false);
    const [showFollowingList, setShowFollowingList] = useState(false);

    // Postovi i komentari
    const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'tags'>('posts');
    const [userPosts, setUserPosts] = useState<PostDto[]>([]);
    const [userComments, setUserComments] = useState<CommentDto[]>([]);
    const [contentLoading, setContentLoading] = useState(false);

    const isOwnProfile = !userId || (user && user.id === parseInt(userId));
    const targetUserId = userId ? parseInt(userId) : user?.id;

    const pageRef = useRef<HTMLDivElement>(null);
    const pCanvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<{ x: number; y: number } | null>(null);

    const [particleDims, setParticleDims] = useState({ W: 0, H: 0 });

    const { draw: drawParticles } = useParticles(
        pCanvasRef,
        mouseRef,
        particleDims.W,
        particleDims.H
    );

    useEffect(() => {
        const page = pageRef.current;
        if (!page) return;

        function resize() {
            if (!page) return;
            const W = page.offsetWidth;
            const vh = window.innerHeight;
            if (pCanvasRef.current) {
                pCanvasRef.current.width = W;
                pCanvasRef.current.height = vh;
            }
            setParticleDims({ W, H: vh });
        }

        setTimeout(resize, 100);
        resize();

        window.addEventListener('resize', resize);

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseLeave = () => {
            mouseRef.current = null;
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    useEffect(() => {
        if (!particleDims.W || !particleDims.H) return;

        let animFrame: number;

        function loop() {
            drawParticles();
            animFrame = requestAnimationFrame(loop);
        }

        animFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrame);
    }, [particleDims, drawParticles]);

    useEffect(() => {
        let ignore = false;

        const loadProfile = async () => {
            if (!targetUserId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const res = isOwnProfile && token
                ? await UserProfileAPIService.getMyProfile()
                : await UserProfileAPIService.getUserProfile(targetUserId);

            if (!ignore) {
                if (res.success && res.data) {
                    setProfile(res.data);
                    setEditForm({
                        firstName: res.data.firstName || '',
                        lastName: res.data.lastName || '',
                        email: res.data.email || '',
                        bio: res.data.bio || '',
                        profileImage: res.data.profileImage || null,
                        username: res.data.username || '',
                        password: '',
                        confirmPassword: ''
                    });
                } else {
                    setError(res.message || 'Failed to load profile');
                }
                setLoading(false);
            }
        };

        loadProfile();

        return () => {
            ignore = true;
        };
    }, [targetUserId, isOwnProfile, token]);

    useEffect(() => {
        if (!targetUserId) return;

        let ignore = false;
        setContentLoading(true);

        Promise.all([
            UserProfileAPIService.getUserPosts(targetUserId),
            UserProfileAPIService.getUserComments(targetUserId),
        ]).then(([postsRes, commentsRes]) => {
            if (ignore) return;
            if (postsRes.success && postsRes.data) setUserPosts(postsRes.data);
            if (commentsRes.success && commentsRes.data) setUserComments(commentsRes.data);
            setContentLoading(false);
        });

        return () => {
            ignore = true;
        };
    }, [targetUserId]);

    const handleFollow = async () => {
        if (!token || !profile) return;

        const res = profile.isFollowing
            ? await UserProfileAPIService.unfollowUser(token, profile.id)
            : await UserProfileAPIService.followUser(token, profile.id);

        if (res.success) {
            setProfile(prev => prev ? {
                ...prev,
                isFollowing: !prev.isFollowing,
                stats: {
                    postCount: prev.stats?.postCount ?? 0,
                    commentCount: prev.stats?.commentCount ?? 0,
                    followerCount: (prev.stats?.followerCount ?? 0) + (prev.isFollowing ? -1 : 1),
                    followingCount: prev.stats?.followingCount ?? 0
                }
            } : null);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (profile) {
            setEditForm({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                bio: profile.bio || '',
                profileImage: profile.profileImage || null,
                username: profile.username || '',
                password: '',
                confirmPassword: ''
            });
        }
    };

    const handleSaveEdit = async () => {
        if (!token || !profile) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (editForm.email && !emailRegex.test(editForm.email)) {
            alert('Please enter a valid email address');
            return;
        }

        if (editForm.username && editForm.username.length < 3) {
            alert('Username must be at least 3 characters');
            return;
        }

        setSaving(true);
        try {
            const res = await UserProfileAPIService.updateProfile(token, {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                email: editForm.email,
                bio: editForm.bio,
                profileImage: editForm.profileImage,
                username: editForm.username,
                password: editForm.password ? editForm.password : undefined
            });

            if (res.success && res.data) {
                setProfile(prev => prev ? {
                    ...prev,
                    firstName: res.data?.firstName || editForm.firstName,
                    lastName: res.data?.lastName || editForm.lastName,
                    email: res.data?.email || editForm.email,
                    bio: res.data?.bio || editForm.bio,
                    profileImage: res.data?.profileImage || editForm.profileImage,
                    username: res.data?.username || editForm.username
                } : null);
                setIsEditing(false);
                alert('Profile updated successfully!');
            } else {
                alert(res.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/feed');
        }
    };

    if (loading) {
        return (
            <div ref={pageRef} className="relative overflow-hidden min-h-screen bg-surface-base">
                <canvas ref={pCanvasRef} className="fixed top-0 left-0 w-full pointer-events-none" style={{ zIndex: 0, height: '100vh' }} />
                <div className="relative min-h-screen">
                    <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                        <div className="h-48 bg-surface-hover rounded-xl animate-pulse mb-6" />
                        <div className="h-64 bg-surface-hover rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div ref={pageRef} className="relative overflow-hidden min-h-screen bg-surface-base">
                <canvas ref={pCanvasRef} className="fixed top-0 left-0 w-full pointer-events-none" style={{ zIndex: 0, height: '100vh' }} />
                <div className="relative min-h-screen">
                    <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                        <div className="text-center py-12 rounded-xl" style={{
                            background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                            border: '1px solid rgba(108, 99, 255, 0.2)',
                        }}>
                            <p className="text-muted-ghost">{error || 'User not found'}</p>
                            <button
                                onClick={goBack}
                                className="mt-4 text-sm text-pulse hover:underline"
                            >
                                Go back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={pageRef}
            className="relative overflow-hidden min-h-screen bg-surface-base text-muted font-dm"
        >
            {/* Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400&display=swap"
                rel="stylesheet"
            />

            {/* PARTICLES BACKGROUND */}
            <canvas
                ref={pCanvasRef}
                className="fixed top-0 left-0 w-full pointer-events-none"
                style={{ zIndex: 0, height: '100vh' }}
            />

            <div className="relative min-h-screen" style={{ zIndex: 2 }}>
                <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">

                    {/* Back button + Edit */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        {isOwnProfile && !isEditing && (
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-pulse/10 text-pulse rounded-lg hover:bg-pulse/20 transition-colors"
                            >
                                <Edit2 size={14} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <ProfileHeader
                        profile={profile}
                        isOwnProfile={isOwnProfile ?? false}
                        onFollow={handleFollow}
                        onFollowersClick={() => setShowFollowersList(true)}
                        onFollowingClick={() => setShowFollowingList(true)}
                    />

                    {/* About Section */}
                    <div className="mt-6 rounded-xl p-6" style={{
                        background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                        border: '1px solid rgba(108, 99, 255, 0.2)',
                    }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-syne text-lg font-bold text-white">About</h2>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                    >
                                        <X size={14} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={saving}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-pulse text-white rounded-lg hover:bg-pulse-80 transition-colors disabled:opacity-50"
                                    >
                                        <Save size={14} />
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Role</h3>
                                <p className="text-white capitalize">{profile.role}</p>
                            </div>

                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Username</h3>
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="text"
                                        name="username"
                                        value={editForm.username}
                                        onChange={handleInputChange}
                                        placeholder="Username"
                                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pulse"
                                    />
                                ) : (
                                    <p className="text-white">@{profile.username}</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">First Name</h3>
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={editForm.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First name"
                                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pulse"
                                    />
                                ) : (
                                    <p className="text-white">{profile.firstName || 'Not set'}</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Last Name</h3>
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={editForm.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last name"
                                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pulse"
                                    />
                                ) : (
                                    <p className="text-white">{profile.lastName || 'Not set'}</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Email</h3>
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleInputChange}
                                        placeholder="Email address"
                                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pulse"
                                    />
                                ) : (
                                    <p className="text-white">{isOwnProfile ? profile.email : '🔒 Hidden'}</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Bio</h3>
                                {isEditing && isOwnProfile ? (
                                    <textarea
                                        name="bio"
                                        value={editForm.bio || ''}
                                        onChange={handleInputChange}
                                        placeholder="Write something about yourself..."
                                        rows={4}
                                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pulse resize-none"
                                    />
                                ) : (
                                    <p className="text-muted leading-relaxed">{profile.bio || 'No bio yet'}</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Password</h3>
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="password"
                                        name="password"
                                        value={editForm.password}
                                        onChange={handleInputChange}
                                        placeholder="Leave blank to keep current"
                                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pulse"
                                    />
                                ) : (
                                    <p className="text-white">••••••••</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Confirm New Password</h3>
                                {isEditing && isOwnProfile ? (
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={editForm.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Repeat new password"
                                        className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pulse"
                                    />
                                ) : (
                                    <p className="text-white">••••••••</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Postovi i Komentari tabovi */}
                    <div className="mt-6 rounded-xl overflow-hidden" style={{
                        background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                        border: '1px solid rgba(108, 99, 255, 0.2)',
                    }}>
                        {/* Tab header */}
                        <div className="flex border-b border-border-subtle">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors relative ${
                                    activeTab === 'posts'
                                        ? 'text-pulse'
                                        : 'text-muted hover:text-white'
                                }`}
                            >
                                <FileText size={14} />
                                Posts
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    activeTab === 'posts' ? 'bg-pulse/20 text-pulse' : 'bg-surface-hover text-muted-ghost'
                                }`}>
                                    {userPosts.length}
                                </span>
                                {activeTab === 'posts' && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pulse" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('comments')}
                                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors relative ${
                                    activeTab === 'comments'
                                        ? 'text-pulse'
                                        : 'text-muted hover:text-white'
                                }`}
                            >
                                <MessageSquare size={14} />
                                Comments
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    activeTab === 'comments' ? 'bg-pulse/20 text-pulse' : 'bg-surface-hover text-muted-ghost'
                                }`}>
                                    {userComments.length}
                                </span>
                                {activeTab === 'comments' && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pulse" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('tags')}
                                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors relative ${
                                    activeTab === 'tags'
                                        ? 'text-pulse'
                                        : 'text-muted hover:text-white'
                                }`}
                            >
                                <Tag size={14} />
                                Tags
                                {activeTab === 'tags' && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pulse" />
                                )}
                            </button>
                        </div>

                        {/* Tab content */}
                        <div className="p-4">
                            {contentLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-surface-hover rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : activeTab === 'posts' ? (
                                userPosts.length === 0 ? (
                                    <div className="text-center py-10">
                                        <FileText size={32} className="mx-auto text-muted-ghost mb-2 opacity-40" />
                                        <p className="text-muted-ghost text-sm">No posts yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {userPosts.map(post => (
                                            <button
                                                key={post.id}
                                                onClick={() => navigate(`/posts/${post.id}`)}
                                                className="w-full text-left rounded-lg p-4 transition-all hover:border-pulse/40"
                                                style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(108, 99, 255, 0.15)',
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-white text-sm font-medium truncate mb-1">
                                                            {post.title}
                                                        </h3>
                                                        <p className="text-muted-ghost text-xs line-clamp-2 leading-relaxed">
                                                            {post.content}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-xs text-muted-ghost">
                                                        {post.communityName && (
                                                            <span className="text-pulse/70">r/{post.communityName} · </span>
                                                        )}
                                                        {new Date(post.createdAt ?? new Date()).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-muted-ghost">
                                                        ♥ {post.likeCount}
                                                    </span>
                                                    <span className="text-xs text-muted-ghost">
                                                        💬 {post.commentCount}
                                                    </span>
                                                    {post.tags && post.tags.length > 0 && (
                                                        <div className="flex gap-1 flex-wrap">
                                                            {post.tags.slice(0, 3).map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    className="text-xs px-1.5 py-0.5 rounded bg-pulse/10 text-pulse/70"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )
                            ) : activeTab === 'comments' ? (
                                userComments.length === 0 ? (
                                    <div className="text-center py-10">
                                        <MessageSquare size={32} className="mx-auto text-muted-ghost mb-2 opacity-40" />
                                        <p className="text-muted-ghost text-sm">No comments yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {userComments.map(comment => (
                                            <button
                                                key={comment.id}
                                                onClick={() => navigate(`/posts/${comment.postId}`)}
                                                className="w-full text-left rounded-lg p-4 transition-all hover:border-pulse/40"
                                                style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(108, 99, 255, 0.15)',
                                                }}
                                            >
                                                <p className="text-muted text-sm leading-relaxed line-clamp-3">
                                                    {comment.content}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className="text-xs text-muted-ghost">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-muted-ghost">
                                                        ♥ {comment.likesCount}
                                                    </span>
                                                    <span className="text-xs text-pulse/60">
                                                        → view post
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <UserTagCloud posts={userPosts} />
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Modals */}
            <FollowersList
                userId={targetUserId!}
                isOpen={showFollowersList}
                onClose={() => setShowFollowersList(false)}
                onFollowerRemoved={() => {
                    if (targetUserId) {
                        const loadProfile = async () => {
                            const res = await UserProfileAPIService.getUserProfile(targetUserId);
                            if (res.success && res.data) {
                                setProfile(res.data);
                            }
                        };
                        loadProfile();
                    }
                }}
                currentUserId={user?.id}
                token={token ?? ''}
            />
            <FollowingList
                userId={targetUserId!}
                isOpen={showFollowingList}
                onClose={() => setShowFollowingList(false)}
                onFollowingChanged={() => {
                    if (targetUserId) {
                        const loadProfile = async () => {
                            const res = await UserProfileAPIService.getUserProfile(targetUserId);
                            if (res.success && res.data) {
                                setProfile(res.data);
                            }
                        };
                        loadProfile();
                    }
                }}
                currentUserId={user?.id}
                token={token ?? ''}
            />
        </div>
    );
}