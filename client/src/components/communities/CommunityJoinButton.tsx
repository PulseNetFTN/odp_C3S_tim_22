import { useState } from 'react';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import { Users } from 'lucide-react';

interface Props {
  communityId: number;
  memberCount: number;
  isJoined: boolean;
  onUpdate: () => void;
}

export function JoinButton({ communityId, memberCount, isJoined, onUpdate }: Props) {
  const [joined, setJoined] = useState(isJoined);
  const [pending, setPending] = useState(false);
  const [hov, setHov] = useState(false);

  const toggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      if (joined) {
        await communityApi.leave(communityId);
      } else {
        await communityApi.join(communityId);
      }
      setJoined(j => !j);
      onUpdate();
    } catch (error) {
      console.error('Error toggling community membership:', error);
    } finally {
      setPending(false);
    }
  };

  const color = joined
    ? 'var(--color-pulse)'
    : hov
    ? 'var(--color-muted)'
    : 'var(--color-muted-ghost)';

  return (
    <button
      onClick={toggle}
      disabled={pending}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="font-dm flex items-center px-3 py-1.5 rounded-full"
      style={{
        gap: '8px',
        background: joined ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${joined ? 'var(--color-pulse)' : 'rgba(255,255,255,0.12)'}`,
        padding: '6px 12px',
        cursor: pending ? 'not-allowed' : 'pointer',
        opacity: pending ? 0.6 : 1,
        color,
        fontSize: '13px',
        fontWeight: 500,
        transition: 'all 0.15s',
      }}
    >
      <Users size={14} strokeWidth={1.5} />
      <span>{joined ? 'Joined' : 'Join'}</span>
      {memberCount > 0 && (
        <span style={{ fontSize: '11px', opacity: 0.7 }}>
          ({memberCount})
        </span>
      )}
    </button>
  );
}