// src/components/admin/AuditLogTable.tsx
import { useState, useEffect, useRef } from 'react';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { AuditLog } from '../../api_services/admin/IAdminAPIService';

interface Props {
    token: string | null;
}

interface AuditCardProps {
    log: AuditLog;
    isExpanded: boolean;
    onToggle: () => void;
}

function AuditCard({ log, isExpanded, onToggle }: AuditCardProps) {
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

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'text-green-400';
            case 'UPDATE': return 'text-blue-400';
            case 'DELETE': return 'text-red-400';
            case 'SOFT_DELETE': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    const getActionBg = (action: string) => {
        switch (action) {
            case 'CREATE': return '#10b98110';
            case 'UPDATE': return '#3b82f610';
            case 'DELETE': return '#ef444410';
            case 'SOFT_DELETE': return '#f59e0b10';
            default: return '#6b728010';
        }
    };

    const formatChanges = (changes: AuditLog['changes']): string => {
        if (!changes) return 'No changes';
        return JSON.stringify(changes, null, 2);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative rounded-xl transition-all duration-300 overflow-hidden cursor-pointer"
            style={{
                background: 'linear-gradient(135deg, #0a0a14 0%, #08080e 100%)',
                border: '1px solid rgba(108, 99, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
            onClick={onToggle}
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

            <div className="relative z-10 p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-ghost">{new Date(log.createdAt).toLocaleString()}</span>
                        <span className="text-white font-medium text-sm">@{log.username}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getActionColor(log.action)}`} style={{ backgroundColor: getActionBg(log.action) }}>
                            {log.action}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-ghost">
                        <span>{log.entityType}</span>
                        <span>#{log.entityId}</span>
                        <span className="font-mono">{log.ipAddress}</span>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-muted-ghost mb-1">Old Data:</p>
                                <pre className="text-xs text-muted overflow-x-auto p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    {log.oldData ? JSON.stringify(log.oldData, null, 2) : 'null'}
                                </pre>
                            </div>
                            <div>
                                <p className="text-xs text-muted-ghost mb-1">New Data:</p>
                                <pre className="text-xs text-muted overflow-x-auto p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    {log.newData ? JSON.stringify(log.newData, null, 2) : 'null'}
                                </pre>
                            </div>
                            <div>
                                <p className="text-xs text-muted-ghost mb-1">Changes:</p>
                                <pre className="text-xs text-muted-ghost overflow-x-auto p-2 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    {formatChanges(log.changes)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AuditLogTable({ token }: Props) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    useEffect(() => {
        let ignore = false;

        const loadLogs = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const res = await AdminAPIService.getAuditLogs(token ?? 'mock-token', 1, 100);
                
                if (!ignore && res.success && res.data) {
                    let logsArray: AuditLog[] = [];
                    
                    if (Array.isArray(res.data)) {
                        logsArray = res.data;
                    } else if (res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
                        logsArray = res.data.data;
                    }
                    
                    setLogs(logsArray);
                } else if (!ignore && res.message && !res.data) {
                    setError(res.message);
                    setLogs([]);
                } else {
                    setLogs([]);
                }
            } catch (err) {
                console.error('Failed to load audit logs:', err);
                setError('Failed to connect to server');
                setLogs([]);
            }
            if (!ignore) setLoading(false);
        };

        loadLogs();

        return () => {
            ignore = true;
        };
    }, [token]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-24 bg-surface-hover rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    // Error se prikazuje SAMO ako nema logova
    if (error && logs.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-red-400 text-sm mb-2">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="text-xs text-pulse hover:text-pulse-80"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-syne text-xl font-bold text-white">Audit Log</h2>
                <p className="text-xs text-muted-ghost">Total: {logs.length}</p>
            </div>

            <div className="space-y-3">
                {logs.length > 0 ? (
                    logs.map(log => (
                        <AuditCard
                            key={log.id}
                            log={log}
                            isExpanded={expandedLog === log.id}
                            onToggle={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        />
                    ))
                ) : (
                    <div className="text-center text-muted-ghost py-8">
                        No audit logs found
                    </div>
                )}
            </div>
        </div>
    );
}