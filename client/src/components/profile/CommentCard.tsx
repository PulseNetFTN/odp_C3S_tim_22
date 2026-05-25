import React from 'react';
import { formatDistanceToNow } from 'date-fns';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  post?: { id: string; title: string; slug: string };
};

type Props = { comment: Comment };

export default function CommentCard({ comment }: Props) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-surface-hover transition-colors">
      <div className="flex items-center justify-between text-xs text-muted">
        <time>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</time>
        {comment.post && (
          <a href={`/post/${comment.post.slug}`} className="text-pulse font-medium truncate">
            {comment.post.title}
          </a>
        )}
      </div>
      <p className="text-sm text-white">{comment.content}</p>
    </div>
  );
}
