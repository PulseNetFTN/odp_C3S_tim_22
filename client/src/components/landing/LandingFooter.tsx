import { useNavigate } from 'react-router-dom';

export default function LandingFooter() {
    const navigate = useNavigate();

    return (
        <footer style={{ background: '#040508' }}>
            {/* Main grid */}
            <div className="px-6 md:px-16 pt-14 md:pt-16 pb-12">
                <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-5">
                        <div className="font-syne text-white font-black text-lg tracking-tight mb-3">
                            Pulse<span className="text-pulse">Net</span>
                        </div>
                        <p
                            className="text-[11px] font-light leading-[1.8] max-w-[230px] mb-4"
                            style={{ color: 'rgba(255,255,255,0.28)' }}
                        >
                            Distributed social networking combining community
                            forums with real-time discussion.
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                            {['Node.js', 'Express', 'PostgreSQL', 'React'].map((tech) => (
                                <span
                                    key={tech}
                                    className="text-[9px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full font-normal"
                                    style={{
                                        color: 'rgba(255,255,255,0.3)',
                                        background: 'rgba(255,255,255,0.05)',
                                    }}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div className="md:col-span-2">
                        <h5
                            className="text-[10px] tracking-[0.14em] uppercase mb-4 font-normal"
                            style={{ color: 'rgba(255,255,255,0.2)' }}
                        >
                            Platform
                        </h5>
                        <ul className="list-none flex flex-col gap-2.5">
                            {[
                                { label: 'Communities', href: '#features' },
                                { label: 'Architecture', href: '#architecture' },
                                { label: 'Roles', href: '#roles' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-xs font-light no-underline transition-colors duration-200"
                                        style={{ color: 'rgba(255,255,255,0.3)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Navigate */}
                    <div className="md:col-span-2">
                        <h5
                            className="text-[10px] tracking-[0.14em] uppercase mb-4 font-normal"
                            style={{ color: 'rgba(255,255,255,0.2)' }}
                        >
                            Navigate
                        </h5>
                        <ul className="list-none flex flex-col gap-2.5">
                            {[
                                { label: 'Feed', action: () => navigate('/feed') },
                                { label: 'Sign in', action: () => navigate('/login') },
                                { label: 'Create account', action: () => navigate('/register') },
                            ].map((link) => (
                                <li key={link.label}>
                                    <button
                                        onClick={link.action}
                                        className="text-xs font-light bg-transparent border-none p-0 cursor-pointer transition-colors duration-200"
                                        style={{ color: 'rgba(255,255,255,0.3)' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                                    >
                                        {link.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Project */}
                    <div className="md:col-span-3">
                        <h5
                            className="text-[10px] tracking-[0.14em] uppercase mb-4 font-normal"
                            style={{ color: 'rgba(255,255,255,0.2)' }}
                        >
                            Project
                        </h5>
                        <ul className="list-none flex flex-col gap-2.5">
                            {['Distributed systems', 'Database replication', 'Full-stack app'].map((item) => (
                                <li key={item}>
                                    <span
                                        className="text-xs font-light"
                                        style={{ color: 'rgba(255,255,255,0.3)' }}
                                    >
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div
                className="px-6 md:px-16 py-4 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
                <p
                    className="text-[11px] font-light tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.15)' }}
                >
                    &copy; {new Date().getFullYear()} PulseNet. All rights reserved.
                </p>

            </div>
        </footer>
    );
}