import React from 'react';
import PostCard from './PostCard';

type Post = {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  community?: { id: string; name: string; slug: string };
  votes?: number;
  commentsCount?: number;
};

type Props = { posts: Post[] };

export default function PostsList({ posts }: Props) {
  if (!posts.length) {
    return (
      <div className="bg-surface-card border border-surface-border rounded-lg shadow-sm p-6 text-center text-muted">
        User has no posts
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
