import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/auth/useAuthHook';

export default function LandingNav() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 py-6 md:py-8">
            {/* Logo Geist font */}
            <div className="font-dm text-white font-extrabold text-2xl tracking-tight">
                <span
                    className="text-white font-black text-xl tracking-tight hidden sm:inline"
                    style={{fontFamily:"'Syne', sans-serif"}}
                >
                    Pulse<span className="text-pulse">Net</span>
                </span>
            </div>

            {/* Desktop nav */}
            <ul className="hidden md:flex gap-10 list-none">
                <li>
                    <a href="#features" className="no-underline text-sm font-light tracking-wider transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Communities
                    </a>
                </li>
                <li>
                    <a href="#features" className="no-underline text-sm font-light tracking-wider transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Architecture
                    </a>
                </li>
                <li>
                    <a href="#roles" className="no-underline text-sm font-light tracking-wider transition-colors duration-200" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Roles
                    </a>
                </li>
            </ul>

            {/* Desktop CTA */}
            {user ? (
                <button
                    onClick={() => navigate('/feed')}
                    className="hidden md:block bg-transparent text-sm tracking-wider px-5 py-2 cursor-pointer transition-all duration-200 rounded-half"
                    style={{
                        color: 'rgba(108,99,255,0.8)',
                        border: '1px solid rgba(108,99,255,0.3)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                    Go to Feed
                </button>
            ) : (
                <button
                    onClick={() => navigate('/login')}
                    className="hidden md:block bg-transparent text-sm tracking-wider px-5 py-2 cursor-pointer transition-all duration-200 rounded-half"
                    style={{
                        color: 'rgba(108,99,255,0.8)',
                        border: '1px solid rgba(108,99,255,0.3)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(108,99,255,0.08)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                    Get started
                </button>
            )}

            {/* Mobile hamburger */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden bg-transparent border-none text-white cursor-pointer p-1"
                aria-label="Toggle menu"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {menuOpen ? (
                        <path d="M6 6l12 12M6 18L18 6" />
                    ) : (
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    )}
                </svg>
            </button>

            {/* Mobile menu */}
            {menuOpen && (
                <div
                    className="absolute top-[70px] left-0 w-full flex flex-col px-6 py-6 gap-4 md:hidden"
                    style={{ zIndex: 50, background: '#08080d', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <a href="#features" onClick={() => setMenuOpen(false)} className="no-underline text-sm font-light tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>Communities</a>
                    <a href="#features" onClick={() => setMenuOpen(false)} className="no-underline text-sm font-light tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>Architecture</a>
                    <a href="#roles" onClick={() => setMenuOpen(false)} className="no-underline text-sm font-light tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>Roles</a>
                    {user ? (
                        <button
                            onClick={() => { navigate('/feed'); setMenuOpen(false); }}
                            className="bg-transparent text-sm tracking-wider px-5 py-2 cursor-pointer rounded-half w-fit"
                            style={{ color: 'rgba(108,99,255,0.8)', border: '1px solid rgba(108,99,255,0.3)' }}
                        >
                            Go to Feed
                        </button>
                    ) : (
                        <button
                            onClick={() => { navigate('/login'); setMenuOpen(false); }}
                            className="bg-transparent text-sm tracking-wider px-5 py-2 cursor-pointer rounded-half w-fit"
                            style={{ color: 'rgba(108,99,255,0.8)', border: '1px solid rgba(108,99,255,0.3)' }}
                        >
                            Get started
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}