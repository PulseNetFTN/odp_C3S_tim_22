import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, User, Clock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { postApi } from '../../api_services/post/PostAPIService';

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

function stripBBCodeTags(raw: string): string {
    return raw.replace(/\[\/?\w+(?:=[^\]]*)?\]/gi, '');
}

function truncateContent(content: string, maxLength: number = 300): string {
    const plain = stripBBCodeTags(content);
    if (plain.length <= maxLength) return content;
    return content.slice(0, maxLength).trimEnd() + '...';
}

function renderBBCode(raw: string): string {
    let html = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>');
    html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>');
    html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>');
    html = html.replace(/\[h\]([\s\S]*?)\[\/h\]/gi, '<h3 style="font-size:1.15em;font-weight:700;margin:0.5em 0 0.25em;">$1</h3>');
    html = html.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, '<blockquote style="border-left:3px solid rgba(108,99,255,0.4);padding:0.5em 1em;margin:0.5em 0;color:rgba(255,255,255,0.6);background:rgba(255,255,255,0.03);border-radius:4px;">$1</blockquote>');
    html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, '<pre style="background:rgba(255,255,255,0.05);padding:0.75em 1em;border-radius:6px;font-family:monospace;font-size:0.85em;overflow-x:auto;">$1</pre>');
    html = html.replace(/\[url=(.*?)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" style="color:#6c63ff;text-decoration:underline;" target="_blank" rel="noopener">$2</a>');
    html = html.replace(/\[\*\](.*?)(?:\n|$)/gi, '<li style="margin-left:1.25em;">$1</li>');
    html = html.replace(/\[img\](.*?)\[\/img\]/gi, '<img src="$1" style="max-width:100%;border-radius:8px;margin:0.5em 0;" />');
    html = html.replace(/\n/g, '<br/>');

    return html;
}

export default function PostCard(props: PostCardProps) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(props.isLiked);
    const [likeCount, setLikeCount] = useState(props.likeCount);
    const [likeLoading, setLikeLoading] = useState(false);

    async function handleLike() {
        if (!user || likeLoading) return;

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
                    disabled={!user || likeLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: user ? 'pointer' : 'default',
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