
const roles = [
    {
        label: 'Guest',
        color: 'rgba(108,99,255,0.75)',
        scope: 'Read-only',
        desc: 'View public communities and posts. No ability to create content or interact.',
    },
    {
        label: 'User',
        color: 'rgba(34,197,94,0.75)',
        scope: 'Create & connect',
        desc: 'Create communities, posts, and comments. Follow users. Manage personal profile.',
    },
    {
        label: 'Administrator',
        color: 'rgba(239,68,68,0.65)',
        scope: 'Full access',
        desc: 'Global access. Manage users, tags, audit logs, and database health status.',
    },
];

import { useScrollReveal } from '../../hooks/other/useScrollReveal';

export default function LandingRoles() {
    const ref = useScrollReveal<HTMLElement>();
    return (
        <section ref={ref} id="roles" className="px-6 md:px-16 py-14 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
                {/* Left heading */}
                <div>
                    <p
                        className="text-[10px] tracking-[0.15em] uppercase mb-4 font-normal"
                        style={{ color: 'rgba(108,99,255,0.55)' }}
                    >
                        Access control
                    </p>
                    <h2 className="font-syne text-white font-black leading-[1.15] tracking-tight mb-3.5"
                        style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)' }}>
                        Three levels of access,<br />one platform
                    </h2>
                    <p
                        className="text-[13px] font-light leading-[1.85] max-w-sm"
                        style={{ color: 'rgba(255,255,255,0.33)' }}
                    >
                        A role system from guest to administrator. Every user gets
                        exactly the access they need no more, no less.
                    </p>
                </div>

                {/* Right role cards */}
                <div className="flex flex-col gap-2.5">
                    {roles.map((r) => (
                        <div
                            key={r.label}
                            className="flex gap-3.5 items-start rounded-[14px] px-6 py-5 transition-all duration-300"
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.03)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)'; }}
                        >
                            <div
                                className="w-2 h-2 rounded-full mt-[5px] shrink-0"
                                style={{ background: r.color }}
                            />
                            <div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className="font-syne font-bold text-[13px] text-white">
                                        {r.label}
                                    </span>
                                    <span
                                        className="text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full font-normal"
                                        style={{
                                            color: 'rgba(108,99,255,0.65)',
                                            background: 'rgba(108,99,255,0.08)',
                                        }}
                                    >
                                        {r.scope}
                                    </span>
                                </div>
                                <p
                                    className="text-[11px] font-light leading-[1.65]"
                                    style={{ color: 'rgba(255,255,255,0.24)' }}
                                >
                                    {r.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}