import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuthHook';
import AppLayout from '../../components/layout/AppLayout';
import CommentSection from '../../components/comments/CommentSection';
import PostPreview from '../../components/comments/PostPreview';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import { postApi } from '../../api_services/post/PostAPIService';
import type { PostDto } from '../../models/posts/PostsDto';

export default function CommentsPage() {
  const { postId: postIdParam } = useParams<{ postId: string }>();
  const postId = postIdParam ? parseInt(postIdParam, 10) : null;

  const { user, token, isAuthenticated } = useAuth();

  const [communities, setCommunities] = useState<{ id: number; name: string }[]>([]);
  const [post, setPost] = useState<PostDto | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
  if (!user) return;

  communityApi.getMine().then(data => {
    if (data.success && data.data) {
      setCommunities(
        data.data
          .map(c => ({ id: c.id, name: c.name ?? c.name ?? '' }))
          .filter(c => c.name !== '')
      );
    }
  });
}, [user]);

  useEffect(() => {
    if (!postId || isNaN(postId)) return;

    let isMounted = true;

    const fetchPost = async () => {
      const res = await postApi.getById(postId);
      if (!isMounted) return;
      
      if (res.success && res.data) {
        setPost(res.data);
        setPostError(null);
      } else {
        setPost(null);
        setPostError(res.message ?? 'Failed to load post');
      }
      setPostLoading(false);
    };

    setPostLoading(true);
    fetchPost().catch(err => {
      if (!isMounted) return;
      console.error('Failed to load post:', err);
      setPost(null);
      setPostError('Failed to load post');
      setPostLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleLoginRequired = () => {
    window.location.href = '/login';
  };

  return (
    <AppLayout communities={communities}>
      {postId === null || isNaN(postId) ? (
        <div className="text-center py-20">
          <p className="text-red-400 text-lg font-medium mb-4">
            Invalid post ID. Please check the URL and try again.
          </p>
          
          <a  href="/"
            className="text-pulse hover:text-pulse-80 underline underline-offset-2"
          >
            Return to home
          </a>
        </div>
      ) : (
        <>
          {postLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse"></div>
              </div>
            </div>
          ) : postError ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg font-medium mb-4">
                {postError}
              </p>
              <a
                href="/"
                className="text-pulse hover:text-pulse-80 underline underline-offset-2"
              >
                Return to home
              </a>
            </div>
          ) : post ? (
            <>
              <PostPreview post={post} />
              <CommentSection
                postId={postId}
                token={token}
                currentUserId={user?.id}
                isAuthenticated={isAuthenticated}
                onLoginRequired={handleLoginRequired}
              />
            </>
          ) : null}
        </>
      )}
    </AppLayout>
  );
}