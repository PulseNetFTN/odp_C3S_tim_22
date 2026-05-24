import { Link } from 'react-router-dom';
import { User, Clock } from 'lucide-react';
import type { PostDto } from '../../models/posts/PostsDto';

interface PostPreviewProps {
    post: PostDto;
}

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return '';
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
}

function truncateContent(content: string, maxLength: number = 300): string {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength).trimEnd() + '...';
}

export default function PostPreview({ post }: PostPreviewProps) {
    return (
        <div
            className="rounded-lg overflow-hidden mb-6 transition-colors hover:border-white/12"
            style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {/* Header: community + author + time */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <Link
                    to={`/communities/${post.communityId}`}
                    className="no-underline text-xs font-bold text-white/90 hover:underline"
                >
                    c/{post.communityName}
                </Link>
                <span className="text-white/20 text-xs">•</span>
                <div className="flex items-center gap-1.5">
                    {post.authorProfileImage ? (
                        <img
                            src={post.authorProfileImage}
                            alt={post.authorUsername}
                            className="w-4 h-4 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                            <User size={10} strokeWidth={1.5} className="text-white/50" />
                        </div>
                    )}
                    <Link
                        to={`/profile/${post.authorId}`}
                        className="no-underline text-xs text-white/50 hover:text-white/70 hover:underline"
                    >
                        {post.authorUsername}
                    </Link>
                </div>
                <span className="text-white/20 text-xs">•</span>
                <div className="flex items-center gap-1">
                    <Clock size={11} strokeWidth={1.5} className="text-white/30" />
                    <span className="text-xs text-white/30">{timeAgo(post.createdAt)}</span>
                </div>
            </div>

            {/* Title */}
            <Link to={`/posts/${post.id}`} className="no-underline">
                <h2 className="px-4 pt-2 pb-1 text-lg font-semibold text-white/90 leading-snug hover:text-white transition-colors">
                    {post.title}
                </h2>
            </Link>

            {/* Content preview */}
            <p className="px-4 pb-3 text-sm text-white/50 leading-relaxed">
                {truncateContent(post.content)}
            </p>

            {/* Media */}
            {post.mediaUrl && (
                <div className="px-4 pb-3">
                    <img
                        src={post.mediaUrl}
                        alt=""
                        className="w-full rounded-lg object-cover"
                        style={{ maxHeight: '300px' }}
                    />
                </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                    {post.tags.map(tag => (
                        <span
                            key={tag}
                            className="text-[11px] px-2 py-0.5 rounded-full text-white/50 font-medium"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div
                className="flex items-center gap-4 px-4 py-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
                <span className="text-xs text-white/40">
                    {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                </span>
                <span className="text-xs text-white/40">
                    {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                </span>
            </div>
        </div>
    );
}
