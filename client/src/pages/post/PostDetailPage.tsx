import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart, MessageSquare, Share2, User, Clock,
  ArrowLeft, Loader2, AlertTriangle, Edit2, Trash2,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import CommentSection from '../../components/comments/CommentSection';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { postApi } from '../../api_services/post/PostAPIService';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import type { PostDto } from '../../models/posts/PostsDto';
import { renderBBCode } from '../../utils/bbcode';

// Time ago helper
function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [myCommunities, setMyCommunities] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const postRes = await postApi.getById(postId);
        if (ignore) return;

        if (postRes.success && postRes.data) {
          setPost(postRes.data);
          setLiked(postRes.data.isLiked);
          setLikeCount(postRes.data.likeCount);
        } else {
          setError('Post not found');
        }

        if (user) {
          const mineRes = await communityApi.getMine();
          if (!ignore && mineRes.success && mineRes.data) {
            setMyCommunities(
              mineRes.data
                .map(c => ({ id: c.id, name: c.name ?? '' }))
                .filter(c => c.name !== '')
            );
          }
        }
      } catch {
        if (!ignore) setError('Failed to load post');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [postId, user]);

  async function handlePostLike() {
    if (!canLike || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = liked ? await postApi.unlike(postId) : await postApi.like(postId);
      if (res.success) {
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
      }
    } catch { /* silent */ }
    finally { setLikeLoading(false); }
  }

  async function handlePostDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      const res = await postApi.remove(postId);
      if (res.success) {
        navigate(post ? `/communities/${post.communityId}` : '/feed', { replace: true });
      }
    } catch { /* silent */ }
  }

  const handleLoginRequired = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <AppLayout communities={myCommunities}>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} strokeWidth={1.5} className="text-white/30 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !post) {
    return (
      <AppLayout communities={myCommunities}>
        <div
          className="rounded-lg px-6 py-12 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <AlertTriangle size={32} strokeWidth={1.5} className="text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">{error || 'Post not found'}</p>
          <Link to="/feed" className="text-xs text-pulse hover:underline mt-3 inline-block no-underline">
            Back to feed
          </Link>
        </div>
      </AppLayout>
    );
  }

  const isAuthor = user?.id === post.authorId;
  const isAdmin = user?.role === 'admin';
  const canLike = !!user && !isAuthor;

  return (
    <AppLayout communities={myCommunities}>
      <div className="max-w-[720px] mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/55 mb-4 transition-colors"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </button>

        {/* Post card */}
        <div
          className="rounded-xl overflow-hidden mb-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-1">
            <Link
              to={`/communities/${post.communityId}`}
              className="no-underline text-xs font-bold text-white/90 hover:underline"
            >
              c/{post.communityName}
            </Link>
            <span className="text-white/20 text-xs">•</span>
            <div className="flex items-center gap-1.5">
              {post.authorProfileImage ? (
                <img src={post.authorProfileImage} alt="" className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={10} strokeWidth={1.5} className="text-white/50" />
                </div>
              )}
              <Link to={`/users/${post.authorId}`} className="no-underline text-xs text-white/50 hover:text-white/70">
                {post.authorUsername}
              </Link>
            </div>
            <span className="text-white/20 text-xs">•</span>
            <span className="text-xs text-white/30 flex items-center gap-1">
              <Clock size={11} strokeWidth={1.5} />
              {timeAgo(post.createdAt)}
            </span>

            {(isAuthor || isAdmin) && (
              <div className="ml-auto flex items-center gap-1">
                {isAuthor && (
                  <button
                    onClick={() => navigate(`/posts/${postId}/edit`)}
                    className="p-1.5 rounded hover:bg-white/5 transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    title="Edit post"
                  >
                    <Edit2 size={13} strokeWidth={1.5} className="text-white/30" />
                  </button>
                )}
                <button
                  onClick={handlePostDelete}
                  className="p-1.5 rounded hover:bg-red-400/5 transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  title="Delete post"
                >
                  <Trash2 size={13} strokeWidth={1.5} className="text-white/25 hover:text-red-400/70" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="px-5 pt-2 pb-1 text-lg font-bold text-white/95 leading-snug" style={{ fontFamily: "'Syne', sans-serif" }}>
            {post.title}
          </h1>

          {/* Content */}
          <div
            className="px-5 pb-3 text-sm text-white/60 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderBBCode(post.content) }}
          />

          {/* Media */}
          {post.mediaUrl && (
            <div className="px-5 pb-4">
              <img
                src={post.mediaUrl}
                alt=""
                className="w-full rounded-lg object-cover"
                style={{ maxHeight: '500px' }}
              />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 pb-3">
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

          {/* Action bar */}
          <div
            className="flex items-center gap-1 px-3 py-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            <button
              onClick={handlePostLike}
              disabled={!canLike || likeLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: 'none',
                border: 'none',
                cursor: canLike ? 'pointer' : 'default',
                color: liked ? 'var(--color-pulse, #6c63ff)' : 'rgba(255,255,255,0.45)',
              }}
            >
              <Heart size={16} strokeWidth={1.5} fill={liked ? 'currentColor' : 'none'} />
              <span>{likeCount}</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/45">
              <MessageSquare size={16} strokeWidth={1.5} />
              <span>{post.commentCount}</span>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white/45 hover:bg-white/5 transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Share2 size={16} strokeWidth={1.5} />
              Share
            </button>
          </div>
        </div>

        {/* Comments delegated to CommentSection */}
        <CommentSection
          postId={postId}
          token={token}
          currentUserId={user?.id}
          isAuthenticated={isAuthenticated}
          onLoginRequired={handleLoginRequired}
        />
      </div>
    </AppLayout>
  );
}