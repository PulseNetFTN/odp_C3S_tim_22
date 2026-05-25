import { useState, useRef } from 'react';
import type { UserProfileDto } from '../../models/users/UserDto';

interface Props {
    profile: UserProfileDto;
    isOwnProfile: boolean;
    onFollow?: () => void;
}

export default function ProfileHeader({ profile, isOwnProfile, onFollow }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    const isFollowing = profile.isFollowing || false;

    const handleFollow = async () => {
        if (isLoading) return;
        setIsLoading(true);
        await onFollow?.();
        setIsLoading(false);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (headerRef.current) {
            const rect = headerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const stats = [
        { label: 'Posts', value: profile.stats?.postCount ?? 0 },
        { label: 'Comments', value: profile.stats?.commentCount ?? 0 },
        { label: 'Followers', value: profile.stats?.followerCount ?? 0 },
        { label: 'Following', value: profile.stats?.followingCount ?? 0 },
    ];

    const username = profile.username ?? 'user';
    const firstName = profile.firstName ?? '';
    const lastName = profile.lastName ?? '';
    const bio = profile.bio ?? '';
    const role = profile.role ?? 'user';
    const profileImage = profile.profileImage ?? null;

    return (
        <div
            ref={headerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative rounded-xl p-6 overflow-hidden transition-all duration-300"
            style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
        >
            {isHovering && (
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

            <div
                className={`absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300 ${
                    isHovering ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                    boxShadow: '0 0 40px rgba(108, 99, 255, 0.4), inset 0 0 20px rgba(108, 99, 255, 0.1)',
                }}
            />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Avatar */}
                    <div className="shrink-0">
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt={username}
                                className="w-24 h-24 rounded-full object-cover border-2 border-pulse"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-pulse/20 flex items-center justify-center border-2 border-pulse">
                                <span className="text-pulse text-3xl font-bold">
                                    {username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="font-syne text-2xl font-bold text-white">@{username}</h1>
                            {role === 'admin' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Admin</span>
                            )}
                        </div>
                        <p className="text-white font-medium">{firstName} {lastName}</p>
                        {bio && (
                            <p className="text-sm text-muted mt-2 max-w-lg">{bio}</p>
                        )}
                        
                        <div className="flex gap-6 mt-4">
                            {stats.map(stat => (
                                <div key={stat.label}>
                                    <span className="font-syne text-xl font-bold text-white">{stat.value}</span>
                                    <span className="text-xs text-muted-ghost ml-1">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0">
                        {isOwnProfile ? (
                            <div className="text-center">
                                <div className="px-5 py-2 rounded-lg bg-pulse/10 text-pulse text-sm font-medium">
                                    This is you
                                </div>
                                <p className="text-xs text-muted-ghost mt-2">Your personal profile</p>
                            </div>
                        ) : (
                            <button
                                onClick={handleFollow}
                                disabled={isLoading}
                                className={`px-5 py-2 rounded-lg transition-all text-sm font-medium ${
                                    isFollowing
                                        ? 'bg-surface-hover border border-border-subtle text-muted hover:border-red-500 hover:text-red-400'
                                        : 'bg-pulse text-white hover:bg-pulse-80'
                                }`}
                            >
                                {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}