import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../helpers/api';
import type { PostDto } from '../../../models/users/UserDto';
import Postcard from '../../post/Postcard';
import { useAuth } from '../../../hooks/auth/useAuthHook';

export default function Posts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          setPosts([]);
          return;
        }
        const res = await apiGet<PostDto[]>(`posts/user/${user.id}`);
        if (!mounted) return;
        if (res.success && res.data) {
          setPosts(res.data);
        } else {
          setError(res.message ?? 'Failed to load posts.');
        }
      } catch {
        if (mounted) setError('Network error while loading posts.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) return <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">Loading posts…</div>;
  if (error) return <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">{error}</div>;
  if (!posts || posts.length === 0) return <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">No posts yet.</div>;

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <div key={p.id} className="bg-transparent">
          <Postcard post={p} />
        </div>
      ))}
    </div>
  );
}
