import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '../../components/profile/ProfileHeader';
import PostsList from '../../components/profile/PostsList';
import CommentsList from '../../components/profile/CommentList';
import { fetchProfile, fetchUserPosts, fetchUserComments } from '../../profileApi';

export type Profile = {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  followersCount?: number;
  followingCount?: number;
};

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!username) return;
    fetchProfile(username).then(setProfile).catch(console.error);
    fetchUserComments(username).then(setComments).catch(console.error);
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [username]);

  useEffect(() => {
    if (!username || !hasMore || loadingRef.current) return;
    loadingRef.current = true;
    fetchUserPosts(username, page)
      .then((data) => {
        setPosts((prev) => [...prev, ...data.items]);
        setHasMore(Boolean(data.hasMore));
      })
      .catch(console.error)
      .finally(() => {
        loadingRef.current = false;
      });
  }, [username, page, hasMore]);

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
        setPage((p) => p + 1);
      }
    },
    [hasMore]
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(onIntersect, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [onIntersect]);

  return (
    <div className="min-h-screen bg-surface-base text-muted font-dm">
      <div className="container mx-auto px-6 md:px-16 py-10">
        {profile && <ProfileHeader profile={profile} />}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-6">
            <PostsList posts={posts} />
            <div ref={sentinelRef} className="h-8 flex items-center justify-center">
              {hasMore ? (
                <span className="text-pulse-80 text-sm">Loading...</span>
              ) : (
                <span className="text-muted text-sm">No more posts</span>
              )}
            </div>
          </main>
          <aside className="lg:col-span-1">
            <CommentsList comments={comments} />
          </aside>
        </div>
      </div>
    </div>
  );
}
