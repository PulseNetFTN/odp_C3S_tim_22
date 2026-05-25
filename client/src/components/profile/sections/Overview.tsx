import React, { useEffect, useState } from 'react';
import type { UserDto } from '../../../models/users/UserDto';
import { usersApiService } from '../../../api_services/users/UsersAPIService';
import { useAuth } from '../../../hooks/auth/useAuthHook';
import Posts from './Posts';
import UserComments from './UserComments';

export default function Overview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await usersApiService.getMe();
        if (!mounted) return;
        if (res.success && res.data) {
          setProfile(res.data);
        } else {
          setError(res.message ?? 'Failed to load profile.');
        }
      } catch {
        if (mounted) setError('Network error while loading profile.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">
        Loading profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">
        No profile data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-[rgba(10,10,16,0.6)] p-5 rounded-lg border border-[var(--color-border-subtle)]">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <img
            src={profile.profileImage || '/assets/default-avatar.png'}
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-24 h-24 rounded-lg object-cover border border-[rgba(255,255,255,0.06)]"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="mt-1 text-[var(--color-muted)]">@{profile.username}</p>
                <p className="text-[var(--color-muted-soft)] mt-1">Role: {profile.role}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.03)]">
              <h2 className="text-lg mb-2">About</h2>
              <p className="text-[var(--color-muted-strong)] whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>
            </div>
            <div className="flex gap-6 mt-6">
              <div>
                <div className="text-[var(--color-muted)] text-sm">Email</div>
                <div className="mt-1">{profile.email}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Posts</h2>
        <Posts />
      </section>

      <section>
        <h2 className="text-lg font-medium mb-3">Comments</h2>
        <UserComments />
      </section>
    </div>
  );
}
