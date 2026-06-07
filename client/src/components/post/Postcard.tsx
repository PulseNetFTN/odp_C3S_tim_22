import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, User, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { postApi } from '../../api_services/post/PostAPIService';
import { renderBBCode, truncateContent } from '../../utils/bbcode';

interface PostCardProps {
    id: number;
    title: string;
    content: string;
    mediaUrl: string | null;
    communityId: number;
    communityName: string;
    authorId: number;
    authorUsername: string;
    authorProfileImage: string | null;
    isLiked: boolean;
    likeCount: number;
    commentCount: number;
    tags: string[];
    createdAt: string | null;
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


export default function PostCard(props: PostCardProps) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(props.isLiked);
    const [likeCount, setLikeCount] = useState(props.likeCount);
    const [likeLoading, setLikeLoading] = useState(false);

    const isOwnPost = user?.id === props.authorId;

    async function handleLike() {
        if (!user || likeLoading || isOwnPost) return;

        setLikeLoading(true);
        try {
            const res = liked
                ? await postApi.unlike(props.id)
                : await postApi.like(props.id);

            if (res.success) {
                setLiked(!liked);
                setLikeCount(prev => liked ? prev - 1 : prev + 1);
            }
        } catch {
            // silently fail
        } finally {
            setLikeLoading(false);
        }
    }

    return (
        <div
            className="rounded-lg overflow-hidden transition-colors hover:border-white/12"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}
        >
            {/* Header community + author + time */}
            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <Link
                    to={`/communities/${props.communityId}`}
                    className='no-underline text-xs font-bold text-white/90 hover:underline'
                >
                    c/{props.communityName}
                </Link>
                <span className="text-white/20 text-xs">•</span>
                <div className="flex items-center gap-1.5">
                    {props.authorProfileImage ? (
                        <img
                            src={props.authorProfileImage}
                            alt={props.authorUsername}
                            className="w-4 h-4 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                            <User size={10} strokeWidth={1.5} className="text-white/50" />
                        </div>
                    )}
                    <Link
                        to={`/profile/${props.authorId}`}
                        className="no-underline text-xs text-white/50 hover:text-white/70 hover:underline"
                    >
                        {props.authorUsername}
                    </Link>
                </div>
                <span className="text-white/20 text-xs">•</span>
                <div className="flex items-center gap-1">
                    <Clock size={11} strokeWidth={1.5} className="text-white/30" />
                    <span className="text-xs text-white/30">{timeAgo(props.createdAt)}</span>
                </div>
            </div>
            {/* Title */}
            <Link to={`/post/${props.id}/comments`} className="no-underline">
                <h3 className="px-4 pt-1 pb-1 text-[15px] font-semibold text-white/90 leading-snug hover:text-white transition-colors">
                    {props.title}
                </h3>
            </Link>

            {/* Content preview */}
            <div
                className="px-4 pb-2 text-sm text-white/50 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderBBCode(truncateContent(props.content)) }}
            />

            {/* Media */}
            {props.mediaUrl && (
                <div className="px-4 pb-3">
                    <img
                        src={props.mediaUrl}
                        alt=""
                        className="w-full rounded-lg object-cover"
                        style={{ maxHeight: '400px' }}
                    />
                </div>
            )}

            {/* Tags */}
            {props.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                    {props.tags.map(tag => (
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

            {/* Actions bar */}
            <div
                className="flex items-center gap-1 px-2 py-1.5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
                {/* Like */}
                <button
                    onClick={handleLike}
                    disabled={!user || likeLoading || isOwnPost}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: user && !isOwnPost ? 'pointer' : 'default',
                        color: liked ? 'var(--color-pulse, #6366f1)' : 'rgba(255,255,255,0.45)',
                    }}
                >
                    <Heart
                        size={16}
                        strokeWidth={1.5}
                        fill={liked ? 'currentColor' : 'none'}
                    />
                    <span>{likeCount}</span>
                </button>

                {/* Comments */}
                <Link
                    to={`/post/${props.id}/comments`}
                    className="no-underline flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/45 hover:bg-white/5 transition-colors"
                >
                    <MessageSquare size={16} strokeWidth={1.5} />
                    <span>{props.commentCount}</span>
                </Link>

                {/* Share */}
                <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/posts/${props.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/45 hover:bg-white/5 transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <Share2 size={16} strokeWidth={1.5} />
                    <span>Share</span>
                </button>
            </div>
        </div>
    );
}