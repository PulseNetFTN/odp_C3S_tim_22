import { useState, useEffect, useRef } from 'react';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { CommunityDto } from '../../models/communities/CommunityDto';

interface Props {
    token: string | null;
}

interface CommunityCardProps {
    community: CommunityDto;
    onDelete: (id: number) => Promise<void>;
    isDeleting: boolean;
}



function CommunityCard({ community, onDelete, isDeleting }: CommunityCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(true);
    };

    const handleConfirmDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onDelete(community.id);
        setShowConfirm(false);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowConfirm(false);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative rounded-xl p-5 transition-all duration-300 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
        >
            {isHovering && !showConfirm && (
                <div
                    className="absolute pointer-events-none transition-opacity duration-150"
                    style={{
                        left: mousePosition.x - 200,
                        top: mousePosition.y - 200,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(108, 99, 255, 0.25) 0%, transparent 70%)',
                        opacity: 0.8,
                    }}
                />
            )}

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-pulse/20 flex items-center justify-center">
                        <svg className="w-6 h-6 text-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-syne font-bold text-white">{community.name}</h3>
                        <p className="text-xs text-muted-ghost">ID: {community.id} • Creator: {community.creatorId}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${community.type === 'public' ? 'text-green-400' : 'text-yellow-400'}`} style={{ backgroundColor: community.type === 'public' ? '#10b98110' : '#f59e0b10' }}>
                            {community.type}
                        </span>
                        <button
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                            title="Delete community"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <p className="text-sm text-muted mt-2 line-clamp-2">{community.description || 'No description'}</p>

                <div className="flex gap-4 mt-3 pt-2 border-t border-border-subtle">
                    <span className="text-xs text-muted-ghost flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {community.memberCount} members
                    </span>
                    {community.createdAt && (
                        <span className="text-xs text-muted-ghost flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(community.createdAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div 
                    className="absolute inset-0 z-20 flex items-center justify-center rounded-xl"
                    style={{ background: 'rgba(0, 0, 0, 0.9)' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-center p-4">
                        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-white text-sm mb-3">Delete "{community.name}"?</p>
                        <p className="text-muted-ghost text-xs mb-4">This action cannot be undone.</p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={handleCancelDelete}
                                className="px-3 py-1 text-xs bg-surface-hover text-white rounded-lg hover:bg-surface"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


export default function CommunitiesTable({ token }: Props) {
    const [communities, setCommunities] = useState<CommunityDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const limit = 15;

    useEffect(() => {
        let ignore = false;

        const loadCommunities = async () => {
            setLoading(true);
            
            try {
        const res = await AdminAPIService.getAllCommunities(token ?? '', page, limit);

        if (!ignore && res.success && res.data) {
            setCommunities(res.data.data);
            setTotalPages(res.data.totalPages);
            setTotal(res.data.total);
        } else {
            setCommunities([]);
        }
            } catch (error) {
                console.error('Failed to load communities:', error);
                setCommunities([]);
            }
            if (!ignore) setLoading(false);
        };

        loadCommunities();

        return () => {
            ignore = true;
        };
    }, [token, page, limit]);

    const handleDeleteCommunity = async (communityId: number) => {
        setDeletingId(communityId);
        
        try {
            const res = await AdminAPIService.deleteCommunity(token ?? '', communityId);
            
            if (res.success) {
                // Remove community from list
                setCommunities(prev => prev.filter(c => c.id !== communityId));
                setTotal(prev => prev - 1);
                console.log(`Community ${communityId} deleted successfully`);
            } else {
                console.error('Failed to delete community:', res.message);
                alert(res.message || 'Failed to delete community');
            }
        } catch (error) {
            console.error('Error deleting community:', error);
            alert('An error occurred while deleting the community');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-syne text-xl font-bold text-white">Communities</h2>
                <p className="text-xs text-muted-ghost">Total: {total}</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-40 bg-surface-hover rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {communities.length > 0 ? (
                            communities.map(community => (
                                <CommunityCard 
                                    key={community.id} 
                                    community={community} 
                                    onDelete={handleDeleteCommunity}
                                    isDeleting={deletingId === community.id}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center text-muted-ghost py-8">
                                No communities found
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-subtle">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="text-xs text-muted-ghost hover:text-muted disabled:opacity-40"
                            >
                                ← Previous
                            </button>
                            <span className="text-xs text-muted-ghost">Page {page} of {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="text-xs text-muted-ghost hover:text-muted disabled:opacity-40"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}