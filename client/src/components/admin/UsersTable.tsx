// src/components/admin/UsersTable.tsx
import { useState, useEffect, useRef } from 'react';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { AdminUserDto } from '../../models/users/UserDto';

interface Props {
    token: string | null;
}

interface UserCardProps {
    user: AdminUserDto;
    onRoleChange: (userId: number, newRole: string) => Promise<void>;
    isUpdating: boolean;
}

function UserCard({ user, onRoleChange, isUpdating }: UserCardProps) {
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

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-400';
            case 'user': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="relative rounded-xl p-5 transition-all duration-300 overflow-hidden cursor-pointer"
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
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pulse/20 flex items-center justify-center">
                            <span className="text-pulse font-bold text-lg">
                                {user.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>
                        <div>
                            <a href={`/profile/${user.id}`} className="text-white hover:underline">
                                <h3 className="font-syne font-bold text-white">@{user.username}</h3>
                            </a>
                            <p className="text-xs text-muted-ghost">{user.firstName} {user.lastName}</p>
                        </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`} style={{ backgroundColor: `${user.role === 'admin' ? '#ef4444' : user.role === 'user' ? '#3b82f6' : '#6b7280'}10` }}>
                        {user.role}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                        <p className="text-xs text-muted-ghost">Email</p>
                        <p className="text-muted">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                    <span className="text-xs text-muted-ghost">ID: {user.id}</span>
                    <select
                        value={user.role}
                        onChange={e => onRoleChange(user.id, e.target.value)}
                        disabled={isUpdating}
                        className="text-xs bg-surface-base border border-border-subtle rounded px-2 py-1 text-muted focus:outline-none focus:border-pulse"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default function UsersTable({ token }: Props) {
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingRole, setUpdatingRole] = useState<number | null>(null);

    useEffect(() => {
        let ignore = false;

        const loadUsers = async () => {
            setLoading(true);
            setError(null);
            
            if (!token) {
                setLoading(false);
                return;
            }
            
            try {
                const res = await AdminAPIService.getAllUsers(token, 1, 100);
                
                if (!ignore && res.success && res.data) {
                    let usersArray: AdminUserDto[] = [];
                    
                    if (Array.isArray(res.data)) {
                        usersArray = res.data;
                    } else if (res.data && typeof res.data === 'object' && Array.isArray(res.data.data)) {
                        usersArray = res.data.data;
                    }
                    
                    setUsers(usersArray);
                } else if (!ignore) {
                    if (res.message && !res.data) {
                        setError(res.message);
                    }
                    setUsers([]);
                }
            } catch (err) {
                console.error('Failed to load users:', err);
                setError('Failed to connect to server');
                setUsers([]);
            }
            if (!ignore) setLoading(false);
        };

        loadUsers();

        return () => {
            ignore = true;
        };
    }, [token]);

    const updateRole = async (userId: number, newRole: string) => {
        if (!token) return;

        const oldUser = users.find(u => u.id === userId);
        if (!oldUser) return;

        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setUpdatingRole(userId);

        try {
            const res = await AdminAPIService.updateUserRole(token, userId, newRole);
            
            if (!res.success) {
                setUsers(prev => prev.map(u => u.id === userId ? oldUser : u));
                setError(res.message ?? 'Failed to update role');
            }
        } catch (err) {
            setUsers(prev => prev.map(u => u.id === userId ? oldUser : u));
            console.error('Failed to update role:', err);
            setError('Failed to update role. Please try again.');
        } finally {
            setUpdatingRole(null);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-surface-hover rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error && users.length === 0) {
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
                <h2 className="font-syne text-xl font-bold text-white">Users</h2>
                <p className="text-xs text-muted-ghost">Total: {users.length}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {users.length > 0 ? (
                    users.map(user => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onRoleChange={updateRole}
                            isUpdating={updatingRole === user.id}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center text-muted-ghost py-8">
                        No users found
                    </div>
                )}
            </div>
        </div>
    );
}