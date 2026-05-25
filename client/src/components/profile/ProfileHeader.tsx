import React from 'react';
import type { Profile } from '../../pages/profile/ProfilePage';

type Props = { profile: Profile };

export default function ProfileHeader({ profile }: Props) {
  const currentUser = localStorage.getItem('username');
  const isOwner = currentUser === profile.username;

  return (
    <header className="bg-surface-card border border-surface-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
      <img
        src={profile.avatarUrl ?? '/default-avatar.png'}
        alt={profile.username}
        className="w-28 h-28 rounded-full object-cover border-2 border-pulse shadow"
      />
      <div className="flex-1 min-w-0">
        <h1 className="font-syne text-white text-2xl font-bold truncate">{profile.displayName ?? profile.username}</h1>
        {profile.bio && <p className="mt-2 text-muted text-sm">{profile.bio}</p>}
        <div className="mt-4 flex gap-6 text-sm text-muted">
          <span><strong className="text-white">{profile.followersCount ?? 0}</strong> followers</span>
          <span><strong className="text-white">{profile.followingCount ?? 0}</strong> following</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex gap-2">
        {isOwner ? (
          <button className="px-4 py-2 bg-pulse text-white rounded-half text-sm">Edit profile</button>
        ) : (
          <>
            <button className="px-4 py-2 border border-surface-border text-muted rounded-half text-sm">Message</button>
            <button className="px-4 py-2 bg-pulse text-white rounded-half text-sm">Follow</button>
          </>
        )}
      </div>
    </header>
  );
}
