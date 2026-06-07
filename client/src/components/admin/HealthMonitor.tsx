import { useState, useEffect, useRef } from 'react';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { HealthStatus, NodeStatus } from '../../api_services/admin/IAdminAPIService';
import { useAuth } from '../../hooks/auth/useAuthHook';

interface Props {
    onRefresh?: () => void;
}

interface HealthCardProps {
    node: NodeStatus;
    port: number;
}

function HealthCard({ node, port }: HealthCardProps) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-400';
            case 'degraded': return 'text-yellow-400';
            case 'unreachable': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-500';
            case 'degraded': return 'bg-yellow-500';
            case 'unreachable': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'healthy': return 'HEALTHY';
            case 'degraded': return 'DEGRADED';
            case 'unreachable': return 'UNREACHABLE';
            default: return 'UNKNOWN';
        }
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
                    <span className="font-syne font-bold text-white text-lg">{node.name}</span>
                    <div className={`w-2 h-2 rounded-full ${getStatusBgColor(node.status)} animate-pulse`} />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Status</span>
                        <span className={getStatusColor(node.status)}>{getStatusText(node.status)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Latency</span>
                        <span className="text-muted">{node.responseTime >= 0 ? `${node.responseTime}ms` : '?'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Port</span>
                        <span className="text-muted-ghost font-mono">{port}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-ghost">Last Check</span>
                        <span className="text-muted-ghost text-xs">
                            {node.lastChecked ? new Date(node.lastChecked).toLocaleTimeString() : 'Never'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const NODE_PORTS: Record<string, number> = {
    master: 5432,
    slave1: 5433,
    slave2: 5434,
};

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
            if (res.success && res.data) {
                setHealth(res.data);
            } else if (res.message && !res.data) {
                setError(res.message);
            }
        } catch {
            setError('Failed to connect to health endpoint');
        }
    };

    useEffect(() => {
        let ignore = false;

        const fetchHealth = async () => {
            try {
                const res = await AdminAPIService.getHealthDB();
                if (ignore) return;
                if (res.success && res.data) {
                    setHealth(res.data);
                    setError(null);
                } else if (res.message && !res.data) {
                    setError(res.message);
                }
            } catch {
                if (!ignore) setError('Failed to connect to health endpoint');
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        fetchHealth();
        const intervalId = setInterval(fetchHealth, 10000);

        return () => {
            ignore = true;
            clearInterval(intervalId);
        };
    }, []);

    const handleFailover = async () => {
        if (!health) {
            alert('Health data not available.');
            return;
        }

        const slaveIndex = health.nodes.findIndex(
            (n, i) => i > 0 && n.status !== 'unreachable'
        );

        if (slaveIndex === -1) {
            alert('No healthy slaves available for failover.');
            return;
        }

        if (!confirm(`Trigger failover to ${health.nodes[slaveIndex].name}? This will promote it to master.`)) return;

        setFailovering(true);
        setError(null);

        try {
            const res = await AdminAPIService.triggerFailover(token!, slaveIndex - 1);
            if (res.success) {
                alert(res.data?.message || 'Failover triggered');
                await loadHealth();
                onRefresh?.();
            } else {
                setError(res.message || 'Failover failed');
                alert('Failover failed: ' + (res.message || 'Unknown error'));
            }
        } catch {
            setError('Failed to trigger failover');
            alert('Failed to trigger failover.');
        } finally {
            setFailovering(false);
        }
    };

    if (loading && !health && !error) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-48 bg-surface-hover rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error && !health) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <button onClick={loadHealth} className="text-xs text-pulse hover:text-pulse-80 underline underline-offset-2">
                    Try again
                </button>
            </div>
        );
    }

    if (!health) return null;

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

            {error && health && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-400">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                {health.nodes.map(node => (
                    <HealthCard
                        key={node.name}
                        node={node}
                        port={NODE_PORTS[node.name] ?? 5432}
                    />
                ))}
            </div>

            <div className="rounded-xl p-4" style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.2)',
            }}>
                <h3 className="text-sm font-medium text-white mb-3">Active Connections</h3>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${health.connections.read === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-muted-ghost">Read: </span>
                        <span className={`text-xs ${health.connections.read === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                            {health.connections.read.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${health.connections.write === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-muted-ghost">Write: </span>
                        <span className={`text-xs ${health.connections.write === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                            {health.connections.write.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}