import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { useEKG } from '../../hooks/other/useEKG';
import { useParticles } from '../../hooks/other/useParticles';
import { UserProfileAPIService } from '../../api_services/users/UserProfileAPIService';
import type { UserProfileDto } from '../../models/users/UserDto';
import ProfileHeader from '../../components/profile/ProfileHeader';
import { ArrowLeft, Edit2, Save, X } from 'lucide-react';

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
        username: ''
    });
    const [saving, setSaving] = useState(false);
    
    const isOwnProfile = !userId || (user && user.id === parseInt(userId));
    const targetUserId = userId ? parseInt(userId) : user?.id;

    const pageRef = useRef<HTMLDivElement>(null);
    const ekgWrapRef = useRef<HTMLDivElement>(null);
    const pCanvasRef = useRef<HTMLCanvasElement>(null);
    const eCanvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<{ x: number; y: number } | null>(null);

    const [ekgDims, setEkgDims] = useState({ W: 0, H: 0 });
    const [particleDims, setParticleDims] = useState({ W: 0, H: 0 });

    const { draw: drawEKG } = useEKG(eCanvasRef, ekgDims.W, ekgDims.H);
    const { draw: drawParticles } = useParticles(
        pCanvasRef,
        mouseRef,
        particleDims.W,
        particleDims.H
    );

    useEffect(() => {
        const page = pageRef.current;
        const ekgWrap = ekgWrapRef.current;
        if (!page || !ekgWrap) return;

        function resize() {
            if (!page || !ekgWrap) return;
            const W = page.offsetWidth;
            const ekgH = ekgWrap.offsetHeight;

            if (eCanvasRef.current) {
                eCanvasRef.current.width = W;
                eCanvasRef.current.height = ekgH > 0 ? ekgH : 400;
            }
            setEkgDims({ W, H: ekgH > 0 ? ekgH : 400 });

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

        const ekgObserver = new ResizeObserver(resize);
        ekgObserver.observe(ekgWrap);

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
            ekgObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!ekgDims.W || !ekgDims.H || !particleDims.W || !particleDims.H) return;

        let animFrame: number;

        function loop() {
            drawParticles();
            drawEKG();
            animFrame = requestAnimationFrame(loop);
        }

        animFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrame);
    }, [ekgDims, particleDims, drawParticles, drawEKG]);

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
                        username: res.data.username || ''
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
                username: profile.username || ''
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
                username: editForm.username
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
                <div ref={ekgWrapRef} className="relative min-h-screen">
                    <canvas ref={eCanvasRef} className="absolute top-0 left-0 w-full pointer-events-none" style={{ zIndex: 0, height: '100%' }} />
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
                <div ref={ekgWrapRef} className="relative min-h-screen">
                    <canvas ref={eCanvasRef} className="absolute top-0 left-0 w-full pointer-events-none" style={{ zIndex: 0, height: '100%' }} />
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

            {/* EKG BACKGROUND */}
            <canvas
                ref={eCanvasRef}
                className="fixed top-0 left-0 w-full pointer-events-none"
                style={{ zIndex: 1, height: '100%' }}
            />

            {/* MAIN CONTENT */}
            <div ref={ekgWrapRef} className="relative z-10">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Back Button */}
                    <div className="mb-4 flex items-center justify-between">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-ghost hover:text-white hover:bg-white/5 transition-all duration-150"
                        >
                            <ArrowLeft size={18} strokeWidth={1.5} />
                            <span className="text-sm">Back</span>
                        </button>
                        
                        {/* Edit Button - only for own profile */}
                        {isOwnProfile && !isEditing && (
                            <button
                                onClick={handleEditClick}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-pulse hover:text-pulse-80 hover:bg-pulse/10 transition-all duration-150"
                            >
                                <Edit2 size={16} strokeWidth={1.5} />
                                <span className="text-sm">Edit Profile</span>
                            </button>
                        )}
                    </div>

                    <ProfileHeader
                        profile={profile}
                        isOwnProfile={isOwnProfile ?? false}
                        onFollow={handleFollow}
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
                            {/* Member since section REMOVED */}
                            
                            <div>
                                <h3 className="text-sm text-muted-ghost mb-1">Role</h3>
                                <p className="text-white capitalize">{profile.role}</p>
                            </div>
                            
                            {/* Username - editable */}
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
                            
                            {/* First Name - editable */}
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
                            
                            {/* Last Name - editable */}
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
                            
                            {/* Email - editable only for own profile */}
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
                            
                            {/* Bio - editable */}
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}