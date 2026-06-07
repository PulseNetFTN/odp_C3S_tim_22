import { useScrollReveal } from '../../hooks/other/useScrollReveal';

export default function LandingStats() {
    const ref = useScrollReveal<HTMLElement>();
    return (
        <section ref={ref} className="px-6 md:px-16 py-14 md:py-16">
            {/* Hero stat big number + description */}
            
            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12 mb-14 md:mb-16">
                <div className="shrink-0">
                    <span
                        className="font-syne font-black select-none"
                        style={{
                            fontSize: 'clamp(4.5rem, 9vw, 5.5rem)',
                            lineHeight: '0.82',
                            background: 'linear-gradient(180deg, rgba(108,99,255,0.65) 0%, rgba(108,99,255,0.12) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.04em',
                        }}
                    >
                        3×
                    </span>
                </div>
                <div className="md:pt-2 max-w-md">
                    <h2 className="font-syne text-white font-black text-lg md:text-xl tracking-tight mb-3">
                        Built for resilience
                    </h2>
                    <p
                        className="text-[13px] font-light leading-[1.85]"
                        style={{ color: 'rgba(255,255,255,0.38)' }}
                    >
                        Three replicated database nodes with master-slave replication
                        and automatic failover. Reads balanced, writes consistent,
                        network alive.
                    </p>
                </div>
            </div>

            {/* Three stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { num: 'M:N', label: 'Relational architecture' },
                    { num: 'JWT', label: 'Role-based access' },
                    { num: '0ms', label: 'Failover latency' },
                ].map((s) => (
                    <div
                        key={s.num}
                        className="rounded-[14px] px-7 py-6"
                        style={{ background: 'rgba(255,255,255,0.025)' }}
                    >
                        <div
                            className="font-syne font-black text-2xl mb-1.5"
                            style={{ color: 'rgba(108,99,255,0.65)' }}
                        >
                            {s.num}
                        </div>
                        <div
                            className="text-[11px] font-normal tracking-[0.04em] uppercase"
                            style={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}