import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../helpers/api';
import type { CommentDto } from '../../../models/users/UserDto';
import { useAuth } from '../../../hooks/auth/useAuthHook';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export default function UserComments() {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          setComments([]);
          return;
        }
        const res = await apiGet<CommentDto[]>(`comments/user/${user.id}`);
        if (!mounted) return;
        if (res.success && res.data) {
          setComments(res.data);
        } else {
          setError(res.message ?? 'Failed to load comments.');
        }
      } catch {
        if (mounted) setError('Network error while loading comments.');
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
    return <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">Loading comments…</div>;
  }

  if (error) {
    return <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">{error}</div>;
  }

  if (!comments || comments.length === 0) {
    return <div className="p-6 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[var(--color-border-subtle)]">No comments yet.</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="p-4 rounded-lg bg-[rgba(10,10,16,0.6)] border border-[var(--color-border-subtle)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-md overflow-hidden bg-[rgba(255,255,255,0.03)] flex-shrink-0">
              <img
                src={c.authorProfileImage ?? '/assets/default-avatar.png'}
                alt={c.authorUsername}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-white">{c.authorUsername}</div>
                    <div className="text-[var(--color-muted)] text-sm">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  <Link to={ROUTES.POST(c.postId)} className="text-[var(--color-pulse)] hover:underline">
                    View post
                  </Link>
                </div>
              </div>

              <div className="mt-3 text-[var(--color-muted-strong)] whitespace-pre-wrap">{c.content}</div>

              {c.replies && c.replies.length > 0 && (
                <div className="mt-3 space-y-2 pl-4 border-l border-[rgba(255,255,255,0.03)]">
                  {c.replies.map((r) => (
                    <div key={r.id} className="text-[var(--color-muted)] text-sm">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{r.authorUsername}</div>
                        <div className="text-[var(--color-muted)]">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                      </div>
                      <div className="mt-1">{r.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
