import { useScrollReveal } from '../../hooks/other/useScrollReveal';
export default function LandingFeatures() {
    const ref = useScrollReveal<HTMLElement>();
    return (
        <section ref={ref} id="features" className="px-6 md:px-16 pb-14 md:pb-16">
            {/* Section heading */}
            <p
                className="text-[10px] tracking-[0.15em] uppercase mb-3.5 font-normal"
                style={{ color: 'rgba(108,99,255,0.55)' }}
            >
                Platform
            </p>
            <h2 className="font-syne text-white font-black text-2xl md:text-[28px] leading-[1.15] tracking-tight mb-3.5">
                Everything you need,<br />nothing you don&apos;t
            </h2>
            <p
                className="text-[13px] font-light leading-[1.8] max-w-lg mb-10"
                style={{ color: 'rgba(255,255,255,0.35)' }}
            >
                Communities, feeds, comments, tags, and a full audit trail
                built on distributed infrastructure.
            </p>

            {/* Two hero feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Purple-tinted card */}
                <div
                    className="rounded-2xl px-8 py-9 flex flex-col justify-end min-h-[200px] transition-all duration-300"
                    style={{
                        background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(108,99,255,0.03) 100%)',
                        border: '1px solid rgba(108,99,255,0.08)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.18)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(108,99,255,0.08)'; }}
                >
                    <span
                        className="text-[10px] tracking-[0.12em] uppercase font-normal mb-auto"
                        style={{ color: 'rgba(108,99,255,0.5)' }}
                    >
                        Core
                    </span>
                    <h3 className="font-syne text-white font-black text-[17px] tracking-tight mb-2">
                        Thematic communities
                    </h3>
                    <p
                        className="text-xs font-light leading-[1.75] max-w-[300px]"
                        style={{ color: 'rgba(255,255,255,0.33)' }}
                    >
                        Create and manage communities with hierarchical roles.
                        Moderators control content, membership, and access.
                    </p>
                </div>

                {/* Neutral card */}
                <div
                    className="rounded-2xl px-8 py-9 flex flex-col justify-end min-h-[200px] transition-all duration-300"
                    style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.04)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
                >
                    <span
                        className="text-[10px] tracking-[0.12em] uppercase font-normal mb-auto"
                        style={{ color: 'rgba(108,99,255,0.5)' }}
                    >
                        Infrastructure
                    </span>
                    <h3 className="font-syne text-white font-black text-[17px] tracking-tight mb-2">
                        Distributed database
                    </h3>
                    <p
                        className="text-xs font-light leading-[1.75] max-w-[300px]"
                        style={{ color: 'rgba(255,255,255,0.33)' }}
                    >
                        Master-slave replication with automatic failover. High
                        availability and balanced reads across every node.
                    </p>
                </div>
            </div>

            {/* Four secondary feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    {
                        title: 'Personalized feed',
                        desc: 'Content from communities and followed users, sorted by relevance.',
                    },
                    {
                        title: 'Tag system',
                        desc: 'Admin-managed global tags. Semantic categories for every post.',
                    },
                    {
                        title: 'Hierarchical comments',
                        desc: 'Two-level threads with soft-delete preserving context.',
                    },
                    {
                        title: 'Audit log',
                        desc: 'Complete system action history with paginated admin view.',
                    },
                ].map((f) => (
                    <div
                        key={f.title}
                        className="rounded-[14px] px-6 py-6 transition-all duration-300"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.03)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)'; }}
                    >
                        <h4
                            className="font-syne font-bold text-[13px] tracking-tight mb-1.5"
                            style={{ color: 'rgba(255,255,255,0.75)' }}
                        >
                            {f.title}
                        </h4>
                        <p
                            className="text-[11px] font-light leading-[1.7]"
                            style={{ color: 'rgba(255,255,255,0.22)' }}
                        >
                            {f.desc}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}