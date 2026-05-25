import { useState, useEffect } from 'react';
import { communityApi } from '../../api_services/community/CommunityAPIService';
import CommunityCard from '../../components/communities/CommunityCard';
import AppLayout from '../../components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import type { CommunityDto } from '../../models/communities/CommunityDto';

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<CommunityDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCommunities = async () => {
            const data = await communityApi.getAll();
            if (data.success) {
                setCommunities(data.data || []);
            } else {
                setError(data.message || 'Failed to load communities');
            }
            setLoading(false);
        };

        fetchCommunities();
    }, []);

    return (
        <AppLayout>
            <div className="flex flex-col gap-3">
                <h1 className="text-lg font-bold text-white/90" style={{ fontFamily: "'Syne', sans-serif" }}>
                    All Communities
                </h1>

                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={24} strokeWidth={1.5} className="text-white/30 animate-spin" />
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-lg px-4 py-6 text-center text-sm text-white/50"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && communities.length === 0 && (
                    <div className="rounded-lg px-4 py-12 text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-sm text-white/40">No communities yet</p>
                    </div>
                )}

                {!loading && communities.map(community => (
                    <CommunityCard
                        key={community.id}
                        id={community.id}
                        name={community.name}
                        description={community.description}
                        rules={community.rules}
                        avatar={community.avatar}
                        creatorId={community.creator_id}
                        createdAt={community.createdAt}
                        joined={community.joined}
                    />
                ))}
            </div>
        </AppLayout>
    );
}   