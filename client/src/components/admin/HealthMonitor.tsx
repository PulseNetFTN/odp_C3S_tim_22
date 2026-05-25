// src/components/admin/HealthMonitor.tsx
import { useState, useEffect, useRef } from 'react';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { HealthStatus } from '../../api_services/admin/IAdminAPIService';
import { useAuth } from '../../hooks/auth/useAuthHook';

interface Props {
    onRefresh?: () => void;
}

interface HealthCardProps {
    name: string;
    status: { status: 'up' | 'down' | 'degraded' | 'unreachable'; latency: number; lastChecked: string };
    port: number;
}

function HealthCard({ name, status, port }: HealthCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
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

    // Funkcija za boju statusa
    const getStatusColor = (statusValue: string) => {
        switch (statusValue) {
            case 'up':
            case 'healthy':
                return 'text-green-400';
            case 'degraded':
                return 'text-yellow-400';
            case 'down':
            case 'unreachable':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const getStatusBgColor = (statusValue: string) => {
        switch (statusValue) {
            case 'up':
            case 'healthy':
                return 'bg-green-500';
            case 'degraded':
                return 'bg-yellow-500';
            case 'down':
            case 'unreachable':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (statusValue: string) => {
        switch (statusValue) {
            case 'up':
            case 'healthy':
                return 'HEALTHY';
            case 'degraded':
                return 'DEGRADED';
            case 'down':
            case 'unreachable':
                return 'UNREACHABLE';
            default:
                return 'UNKNOWN';
        }
    };

    const statusValue = status?.status || 'unknown';
    const statusColor = getStatusColor(statusValue);
    const statusBgColor = getStatusBgColor(statusValue);
    const statusText = getStatusText(statusValue);

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
            {isHovering && (
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
                <div className="flex items-center justify-between mb-3">
                    <span className="font-syne font-bold text-white text-lg">{name}</span>
                    <div className={`w-2 h-2 rounded-full ${statusBgColor} animate-pulse`} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Status</span>
                        <span className={statusColor}>
                            {statusText}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Latency</span>
                        <span className="text-muted">{status?.latency ?? '?'}ms</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Port</span>
                        <span className="text-muted-ghost font-mono">{port}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Last Check</span>
                        <span className="text-muted-ghost text-xs">
                            {status?.lastChecked ? new Date(status.lastChecked).toLocaleTimeString() : 'Never'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HealthMonitor({ onRefresh }: Props) {
    const { token } = useAuth();
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [failovering, setFailovering] = useState(false);

    const loadHealth = async () => {
        setError(null);
        
        try {
            const res = await AdminAPIService.getHealthDB();
            console.log('HealthMonitor Response:', res);
            
            if (res.success && res.data) {
                setHealth(res.data);
            } else if (res.message && !res.data) {
                setError(res.message);
            }
        } catch (err) {
            console.error('Failed to load health:', err);
            setError('Failed to connect to health endpoint');
        }
    };

    useEffect(() => {
        let ignore = false;
        let isMounted = true;

        const fetchHealth = async () => {
            try {
                const res = await AdminAPIService.getHealthDB();
                
                if (!ignore && isMounted) {
                    if (res.success && res.data) {
                        setHealth(res.data);
                        setError(null);
                    } else if (res.message && !res.data) {
                        setError(res.message);
                    }
                }
            } catch (err) {
                if (!ignore && isMounted) {
                    console.error('Failed to fetch health:', err);
                    setError('Failed to connect to health endpoint');
                }
            } finally {
                if (!ignore && isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchHealth();
        
        const intervalId = setInterval(() => {
            if (isMounted) {
                fetchHealth();
            }
        }, 10000);

        return () => {
            ignore = true;
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const handleFailover = async () => {
        if (!health) {
            alert('Health data not available. Cannot trigger failover.');
            return;
        }

        // Find the index of the first slave that is up (0 = slave1, 1 = slave2)
        const slaveIndex = health.slave1?.status === 'up' || health.slave1?.status === 'healthy' ? 0 
            : health.slave2?.status === 'up' || health.slave2?.status === 'healthy' ? 1 : null;

        if (slaveIndex === null) {
            alert('No healthy slaves available for failover.');
            return;
        }

        if (!confirm(`Trigger failover to Slave ${slaveIndex + 1}? This will promote it to master.`)) return;

        setFailovering(true);
        setError(null);
        
        try {
            const res = await AdminAPIService.triggerFailover(token!, slaveIndex);
            console.log('Failover Response:', res);
            
            if (res.success) {
                alert(res.data?.message || 'Failover triggered');
                await loadHealth();
                onRefresh?.();
            } else {
                setError(res.message || 'Failover failed');
                alert('Failover failed: ' + (res.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Failover error:', err);
            setError('Failed to trigger failover');
            alert('Failed to trigger failover. Check console for details.');
        } finally {
            setFailovering(false);
        }
    };

    // Helper funkcija za normalizaciju statusa
    const normalizeStatus = (nodeStatus: any) => {
        if (!nodeStatus) return { status: 'unreachable', latency: 0, lastChecked: null };
        
        // Ako je status string
        if (typeof nodeStatus === 'string') {
            let normalizedStatus = nodeStatus;
            if (nodeStatus === 'up') normalizedStatus = 'healthy';
            if (nodeStatus === 'down') normalizedStatus = 'unreachable';
            return { status: normalizedStatus, latency: 0, lastChecked: null };
        }
        
        // Ako je status objekat
        let statusValue = nodeStatus.status;
        if (statusValue === 'up') statusValue = 'healthy';
        if (statusValue === 'down') statusValue = 'unreachable';
        
        return {
            status: statusValue,
            latency: nodeStatus.latency || 0,
            lastChecked: nodeStatus.lastChecked || null
        };
    };

    // Loading state - prvi put kad nema podataka
    if (loading && !health && !error) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 bg-surface-hover rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    // Error state - SAMO ako nema health podataka
    if (error && !health) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <button
                    onClick={loadHealth}
                    className="text-xs text-pulse hover:text-pulse-80 underline underline-offset-2"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!health) return null;

    const nodes = [
        { name: 'Master', status: normalizeStatus(health.master), port: 3306 },
        { name: 'Slave 1', status: normalizeStatus(health.slave1), port: 3307 },
        { name: 'Slave 2', status: normalizeStatus(health.slave2), port: 3308 },
    ];

    // Dohvati replication delay
    const replicationDelay = typeof health.replicationDelay === 'number' ? health.replicationDelay : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-syne text-xl font-bold text-white">Database Health</h2>
                <div className="flex gap-3">
                    <button
                        onClick={loadHealth}
                        disabled={loading}
                        className="text-xs text-muted-ghost hover:text-muted transition-colors disabled:opacity-40"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        onClick={handleFailover}
                        disabled={failovering}
                        className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1 rounded transition-colors disabled:opacity-40"
                    >
                        {failovering ? 'Triggering...' : 'Trigger Failover'}
                    </button>
                </div>
            </div>

            {/* Error message inside content - ne blokira prikaz ako health postoji */}
            {error && health && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {nodes.map(node => (
                    <HealthCard
                        key={node.name}
                        name={node.name}
                        status={node.status}
                        port={node.port}
                    />
                ))}
            </div>

            <div className="relative rounded-xl p-5" style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}>
                <div className="flex items-center justify-between">
                    <span className="font-syne font-bold text-white">Replication Delay</span>
                    <span className={`text-sm font-mono ${replicationDelay > 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {replicationDelay}s
                    </span>
                </div>
                <div className="mt-2 w-full bg-surface-base rounded-full h-1">
                    <div
                        className={`h-1 rounded-full transition-all ${replicationDelay > 5 ? 'bg-yellow-400' : 'bg-green-400'}`}
                        style={{ width: `${Math.min(100, (replicationDelay / 30) * 100)}%` }}
                    />
                </div>
                <p className="text-xs text-muted-ghost mt-2">
                    {replicationDelay === 0
                        ? 'Replication is fully synchronized'
                        : replicationDelay > 10
                            ? 'High replication delay detected'
                            : 'Replication working normally'}
                </p>
            </div>
        </div>
    );
}