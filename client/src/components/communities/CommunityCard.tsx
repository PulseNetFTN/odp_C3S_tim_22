import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CommunityJoinButton } from '../communities/CommunityJoinButton'

interface CommunityCardProps {
    id: number;
    name: string;
    description: string | null;
    rules: string | null;
    avatar: string | null;
    creatorId: number;
    creatorName: string;
    memberCount: number;
    createdAt: string | null;
    joined: boolean;
    
}
 


 
export default function CommunityCard(props: CommunityCardProps) {
    const [joined, setJoined] = useState(props.joined);
    const [memberCount, setMemberCount] = useState(props.memberCount);
   return (
    <div
        className="rounded-lg overflow-hidden transition-colors hover:border-white/12"
        style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',                
        }}
    >
        {/* Header: Community name + creator */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            {/* Avatar */}
            {props.avatar ? (
                <img
                    src={props.avatar}
                    alt={props.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
            ) : (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/70">
                    {props.name.charAt(0).toUpperCase()}
                </div>
            )}
            
            {/* Community info */}
            <div className="flex-1">
                <Link
                    to={`/communities/${props.id}`}
                    className='no-underline text-sm font-bold text-white/90 hover:underline'
                >
                    c/{props.name}
                </Link>
                <p className="text-xs text-white/50">
                    Created by <span className="text-white/70">{props.creatorName}</span>
                </p>
            </div>
        </div>

        {/* Description */}
        {props.description && (
            <p className="px-4 pt-2 pb-3 text-sm text-white/50 leading-relaxed">
                {props.description.length > 150 
                    ? `${props.description.substring(0, 150)}...` 
                    : props.description}
            </p>
        )}

        {/* Stats: Members, Created */}
        <div className="flex gap-4 px-4 py-2 text-xs text-white/40">
            <span>📊 {props.memberCount} members</span>
            <span>📅 {new Date(props.createdAt || '').toLocaleDateString()}</span>
        </div>

        {/* Join Button */}
        <div className="px-4 pb-3 pt-1">
            <CommunityJoinButton
                communityId={props.id}
                memberCount={memberCount}
                isJoined={joined}
                onUpdate={() => {
                    setJoined(!joined);
                    setMemberCount(prev => joined ? prev - 1 : prev + 1);
                }}
            />
        </div>
    </div>
);
}

