// src/components/CommentsList.tsx
import React from 'react';
import CommentCard from './CommentCard';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  post?: { id: string; title: string; slug: string };
};

type Props = { comments: Comment[] };

export default function CommentsList({ comments }: Props) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg shadow-sm p-6">
      <h4 className="text-lg font-bold text-white mb-4">Comments</h4>
      {comments.length === 0 ? (
        <div className="text-sm text-muted">User has no comments</div>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id}>
              <CommentCard comment={c} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
