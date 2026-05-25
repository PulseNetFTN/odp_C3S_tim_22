import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { AdminAPIService } from '../../api_services/admin/AdminAPIService';
import type { HealthStatus } from '../../api_services/admin/IAdminAPIService';
import { useParticles } from '../../hooks/other/useParticles';
import HealthMonitor from '../../components/admin/HealthMonitor';
import UsersTable from '../../components/admin/UsersTable';
import CommunitiesTable from '../../components/admin/CommunitiesTable';
import PostsTable from '../../components/admin/PostsTable';
import AuditLogTable from '../../components/admin/AuditLogTable';
import TagsManager from '../../components/admin/TagsManager';
import Navbar from '../../components/post/Navbar';
import { Activity, Users, Shield, FileText, Tag, Menu, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

type Tab = 'users' | 'communities' | 'posts' | 'audit' | 'tags' | 'health';

interface TabItem {
    id: Tab;
    label: string;
    icon: React.ReactNode;
}

function iconProps() {
    return { size: 20, strokeWidth: 1.5, className: 'text-white/70' };
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('users');
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        'USER MANAGEMENT': false,
        'SYSTEM': false,
        'NAVIGATION': false,
    });

    // Refs za Particle efekte
    const dashboardRef = useRef<HTMLDivElement>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<{ x: number; y: number } | null>(null);

    const [windowDims, setWindowDims] = useState({ W: window.innerWidth, H: window.innerHeight });

    const { draw: drawParticles } = useParticles(
        particleCanvasRef,
        mouseRef,
        windowDims.W,
        windowDims.H
    );

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            const W = window.innerWidth;
            const H = window.innerHeight;
            
            if (particleCanvasRef.current) {
                particleCanvasRef.current.width = W;
                particleCanvasRef.current.height = H;
            }
            
            setWindowDims({ W, H });
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Mouse tracking
        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const onMouseLeave = () => {
            mouseRef.current = null;
        };

        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    // Animation loop za Particle efekte
    useEffect(() => {
        let animFrame: number;

        function loop() {
            drawParticles();
            animFrame = requestAnimationFrame(loop);
        }

        animFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrame);
    }, [drawParticles]);

    // Data fetching za dashboard
    useEffect(() => {
        let ignore = false;

        const loadDashboardData = async () => {
            setLoading(true);
            
            const [healthRes] = await Promise.all([
                AdminAPIService.getHealthDB(),
            ]);
            
            if (!ignore) {
                if (healthRes.success && healthRes.data) setHealth(healthRes.data);
                setLoading(false);
            }
        };

        loadDashboardData();

        return () => {
            ignore = true;
        };
    }, [token]);

    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/feed');
        }
    };

    const tabs: TabItem[] = [
        { 
            id: 'users', 
            label: 'Users',
            icon: <Users {...iconProps()} />
        },
        { 
            id: 'communities', 
            label: 'Communities',
            icon: <Shield {...iconProps()} />
        },
        { 
            id: 'posts', 
            label: 'Posts',
            icon: <FileText {...iconProps()} />
        },
        { 
            id: 'audit', 
            label: 'Audit Log',
            icon: <FileText {...iconProps()} />
        },
        { 
            id: 'tags', 
            label: 'Tags',
            icon: <Tag {...iconProps()} />
        },
        { 
            id: 'health', 
            label: 'Health',
            icon: <Activity {...iconProps()} />
        },
    ];

    const refreshHealth = async () => {
        if (!token) return;
        const healthRes = await AdminAPIService.getHealthDB();
        if (healthRes.success && healthRes.data) {
            setHealth(healthRes.data);
        }
    };

    const toggleSection = (sectionTitle: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionTitle]: !prev[sectionTitle]
        }));
    };

    const userManagementItems = tabs.filter(tab => ['users', 'communities', 'posts'].includes(tab.id));
    const systemItems = tabs.filter(tab => ['audit', 'tags', 'health'].includes(tab.id));

    return (
        <div
            ref={dashboardRef}
            className="relative overflow-hidden min-h-screen bg-surface-base"
        >
            {/* Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap"
                rel="stylesheet"
            />

            {/* PARTICLES BACKGROUND */}
            <canvas
                ref={particleCanvasRef}
                className="fixed top-0 left-0 w-full pointer-events-none"
                style={{ zIndex: 0, height: '100vh' }}
            />

            {/* NAVBAR */}
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* MAIN CONTENT */}
            <div className="relative z-10 pt-14">
                {/* Header - Admin Panel */}
                <div className="sticky top-14 z-20 bg-surface-base/80 backdrop-blur-md border-b border-border-subtle">
                    <div className="max-w-7xl mx-auto px-4 md:px-6">
                        <div className="flex items-center justify-between h-14">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/feed')}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-muted-ghost hover:text-white hover:bg-surface-hover/50 transition-all text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Feed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                    <div className="flex gap-6">
                        {/* Sidebar - Reddit style */}
                        {!isSidebarOpen ? (
                            <div className="fixed top-14 left-0 w-[50px] h-[calc(100vh-56px)] hidden lg:block" style={{ zIndex: 40 }}>
                                <aside
                                    className="w-full h-full"
                                    style={{
                                        background: 'rgba(10, 10, 16, 0.95)',
                                        borderRight: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                />
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="absolute top-20 -right-4 z-10 p-1.5 rounded-full hover:bg-white/10 transition-colors hidden lg:block"
                                    style={{
                                        background: 'rgba(10, 10, 16, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Menu size={20} strokeWidth={1.5} className="text-white/60" />
                                </button>
                            </div>
                        ) : (
                            <div className="fixed top-14 left-0 w-[270px] h-[calc(100vh-56px)]" style={{ zIndex: 40 }}>
                                <div
                                    className="fixed inset-0 top-14 bg-black/50 lg:hidden"
                                    style={{ zIndex: -1 }}
                                    onClick={() => setIsSidebarOpen(false)}
                                />            
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="absolute top-20 -right-4 z-10 p-1.5 rounded-full hover:bg-white/10 transition-colors hidden lg:block"
                                    style={{
                                        background: 'rgba(10, 10, 16, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Menu size={20} strokeWidth={1.5} className="text-white/60" />
                                </button>

                                <aside
                                    className="w-full h-full overflow-y-auto"
                                    style={{
                                        background: 'rgba(10, 10, 16, 0.95)',
                                        borderRight: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <div className="py-3 pt-6 flex flex-col">
                                        {/* NAVIGATION SECTION */}
                                        <div className="mb-1">
                                            <button
                                                onClick={() => toggleSection('NAVIGATION')}
                                                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white/40 uppercase hover:text-white/60 transition-colors"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <span>NAVIGATION</span>
                                                {collapsedSections['NAVIGATION'] 
                                                    ? <ChevronDown size={14} strokeWidth={2} className="text-white/30" />
                                                    : <ChevronUp size={14} strokeWidth={2} className="text-white/30" />
                                                }
                                            </button>

                                            {!collapsedSections['NAVIGATION'] && (
                                                <div className="flex flex-col gap-0.5">
                                                    <button
                                                        onClick={goBack}
                                                        className="w-full flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-150 text-white/70 hover:bg-white/5 hover:text-white"
                                                    >
                                                        <ArrowLeft size={20} strokeWidth={1.5} className="text-white/70" />
                                                        <span className="text-sm font-medium truncate">Go Back</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mx-4 my-2 border-t border-white/6" />

                                        {/* USER MANAGEMENT SECTION */}
                                        <div className="mb-1">
                                            <button
                                                onClick={() => toggleSection('USER MANAGEMENT')}
                                                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white/40 uppercase hover:text-white/60 transition-colors"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <span>USER MANAGEMENT</span>
                                                {collapsedSections['USER MANAGEMENT'] 
                                                    ? <ChevronDown size={14} strokeWidth={2} className="text-white/30" />
                                                    : <ChevronUp size={14} strokeWidth={2} className="text-white/30" />
                                                }
                                            </button>

                                            {!collapsedSections['USER MANAGEMENT'] && (
                                                <div className="flex flex-col gap-0.5">
                                                    {userManagementItems.map(item => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setActiveTab(item.id)}
                                                            className={`w-full flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-150 ${
                                                                activeTab === item.id
                                                                    ? 'bg-white/10 text-white'
                                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                        >
                                                            {item.icon}
                                                            <span className="text-sm font-medium truncate">{item.label}</span>
                                                            {activeTab === item.id && (
                                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pulse animate-pulse" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mx-4 my-2 border-t border-white/6" />

                                        {/* SYSTEM SECTION */}
                                        <div className="mb-1">
                                            <button
                                                onClick={() => toggleSection('SYSTEM')}
                                                className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white/40 uppercase hover:text-white/60 transition-colors"
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                <span>SYSTEM</span>
                                                {collapsedSections['SYSTEM'] 
                                                    ? <ChevronDown size={14} strokeWidth={2} className="text-white/30" />
                                                    : <ChevronUp size={14} strokeWidth={2} className="text-white/30" />
                                                }
                                            </button>

                                            {!collapsedSections['SYSTEM'] && (
                                                <div className="flex flex-col gap-0.5">
                                                    {systemItems.map(item => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setActiveTab(item.id)}
                                                            className={`w-full flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-150 ${
                                                                activeTab === item.id
                                                                    ? 'bg-white/10 text-white'
                                                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                        >
                                                            {item.icon}
                                                            <span className="text-sm font-medium truncate">{item.label}</span>
                                                            {activeTab === item.id && (
                                                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pulse animate-pulse" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        )}

                        {/* Main Content Area - Add margin-left to account for sidebar */}
                        <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[270px]' : 'lg:ml-[50px]'}`}>
                            {loading && (
                                <div className="flex items-center justify-center py-20">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-2 border-pulse/20 border-t-pulse rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-pulse animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="animate-fade-in">
                                {!loading && activeTab === 'users' && <UsersTable token={token} />}
                                {!loading && activeTab === 'communities' && <CommunitiesTable token={token} />}
                                {!loading && activeTab === 'posts' && <PostsTable token={token} />}
                                {!loading && activeTab === 'audit' && <AuditLogTable token={token} />}
                                {!loading && activeTab === 'tags' && <TagsManager token={token} />}
                                {!loading && activeTab === 'health' && <HealthMonitor onRefresh={refreshHealth} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}