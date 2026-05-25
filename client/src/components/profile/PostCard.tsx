import React from 'react';
import { formatDistanceToNow } from 'date-fns';

type Post = {
  id: string;
  title: string;
  body?: string;
  createdAt: string;
  community?: { id: string; name: string; slug: string };
  votes?: number;
  commentsCount?: number;
};

type Props = { post: Post };

export default function PostCard({ post }: Props) {
  return (
    <article className="bg-surface-card border border-surface-border rounded-lg shadow-sm p-4 flex gap-4">
      <div className="flex flex-col items-center w-12">
        <button className="text-muted hover:text-pulse">▲</button>
        <div className="text-sm text-white">{post.votes ?? 0}</div>
        <button className="text-muted hover:text-pulse">▼</button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted mb-1 flex gap-2">
          {post.community && <a href={`/c/${post.community.slug}`} className="text-pulse font-medium">c/{post.community.name}</a>}
          <span>•</span>
          <time>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</time>
        </div>
        <h3 className="text-lg font-bold text-white">{post.title}</h3>
        {post.body && <p className="mt-2 text-muted line-clamp-3">{post.body}</p>}
        <div className="mt-3 flex gap-6 text-sm text-muted">
          <a href={`/post/${post.id}`} className="hover:text-pulse">Comments ({post.commentsCount ?? 0})</a>
          <button className="hover:text-pulse">Share</button>
          <button className="hover:text-pulse">Save</button>
        </div>
      </div>
    </article>
  );
}
