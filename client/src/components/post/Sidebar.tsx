import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Info, HelpCircle, Activity, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import { useState } from 'react';
import { FEED} from '../../constants/feed';


import { useAuth } from '../../hooks/auth/useAuthHook';
 
interface SidebarItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}
 
interface SidebarSection {
    title?: string;
    items: SidebarItem[];
    collapsible?: boolean;
}

function iconProps() {
    return {size: FEED.ICON_SIZE, strokeWidth: FEED.ICON_STROKE, className: 'text-white/70'};
}

function buildSections(isLoggedIn: boolean, isAdmin: boolean, userCommunities: { id: number; name: string }[]): SidebarSection[] {
    const sections: SidebarSection [] = [];

    const mainItems: SidebarItem[] = [
        {label: 'Home', path: '/feed', icon: <Home {...iconProps()} />},
        { label: 'Explore', path: '/explore', icon: <Compass {...iconProps()} /> },
    ];
    sections.push({items: mainItems});

    if(isLoggedIn && userCommunities.length > 0) {
        sections.push({
            title: 'MY COMMUNITIES',
            collapsible: true,
            items: userCommunities.map(c => ({
                label: c.name,
                path: `/communities/${c.id}`,
                icon: <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/70">{c.name.charAt(0).toUpperCase()}</div>,                
            })),
        });
    }

    if (isAdmin) {
        sections.push({
            title: 'ADMIN',
            collapsible: true,
            items: [
                { label: 'Dashboard', path: '/admin', icon: <Activity {...iconProps()} /> },
            ],
        });
    }

    sections.push({
        title: 'RESOURCES',
        collapsible: true,
        items: [
            { label: 'About', path: '/about', icon: <Info {...iconProps()} /> },
            { label: 'Help', path: '/help', icon: <HelpCircle {...iconProps()} /> },
        ],
    });

    return sections;
}

function SidebarSectionBlock({ section }: { section: SidebarSection }) {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="mb-1">
            {section.title && (
                <button
                    onClick={() => section.collapsible && setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-bold tracking-[0.15em] text-white/40 uppercase hover:text-white/60 transition-colors"
                    style={{ cursor: section.collapsible ? 'pointer' : 'default', background: 'none', border: 'none' }}
                >
                    <span>{section.title}</span>
                    {section.collapsible && (
                        collapsed
                            ? <ChevronDown size={14} strokeWidth={2} className="text-white/30" />
                            : <ChevronUp size={14} strokeWidth={2} className="text-white/30" />
                    )}
                </button>
            )}

            {!collapsed && (
                <div className="flex flex-col gap-0.5">
                    {section.items.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="no-underline"
                            >
                                <div
                                    className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all duration-150 ${
                                        isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

interface SidebarProps {
    communities?:{id: number, name: string} [];
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ communities = [], isOpen, onToggle  }: SidebarProps) {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const isAdmin = user?.role === 'admin';

    const sections = buildSections(isLoggedIn, isAdmin, communities);


if (!isOpen) {
    return (
        <div className="fixed top-14 left-0 w-[50px] h-[calc(100vh-56px)] hidden lg:block" style={{ zIndex: 40 }}>
            <aside
                className="w-full h-full"
                style={{
                    background: 'rgba(10, 10, 16, 0.95)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
            />
            <button
                onClick={onToggle}
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
    );
}


// Expanded sidebar
return (
        <div className="fixed top-14 left-0 w-[270px] h-[calc(100vh-56px)]" style={{ zIndex: 40 }}>
        <div
            className="fixed inset-0 top-14 bg-black/50 lg:hidden"
            style={{ zIndex: -1 }}
            onClick={onToggle}
        />            
        <button
            onClick={onToggle}
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
                {sections.map((section, i) => (
                    <div key={i}>
                        {i > 0 && <div className="mx-4 my-2 border-t border-white/6" />}
                        <SidebarSectionBlock section={section} />
                    </div>
                ))}
            </div>
        </aside>
    </div>
);
} 
