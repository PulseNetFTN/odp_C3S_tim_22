import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/auth/useAuthHook';

export default function LandingCTA() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const dotRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let frame: number;
        let t = 0;

        function pulse() {
            t += 0.05;
            if (dotRef.current) {
                dotRef.current.style.opacity = String(Math.sin(t) * 0.35 + 0.65);
            }
            frame = requestAnimationFrame(pulse);
        }

        frame = requestAnimationFrame(pulse);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <section className="px-6 md:px-16 py-20 md:py-32 text-center">
            <div
                className="inline-flex items-center gap-2 text-xs tracking-widest uppercase mb-8 py-1 px-3"
                style={{
                    color: 'rgba(108,99,255,0.5)',
                    border: '1px solid rgba(108,99,255,0.15)',
                    borderRadius: '4px',
                }}
            >
                <span
                    ref={dotRef}
                    className="w-1.5 h-1.5 rounded-full inline-block bg-pulse"
                />
                Master node active
            </div>

            {user ? (
                <>
                    <h2 className="font-syne text-section leading-none tracking-display text-white font-extrabold mb-6">
                        Welcome back,<br />{user.username}!
                    </h2>
                    <p
                        className="text-base font-light leading-loose mb-10 md:mb-12 max-w-sm mx-auto"
                        style={{ color: 'rgba(255,255,255,0.38)' }}
                    >
                        Check out what's new in your favorite communities!
                    </p>
                    <button
                        onClick={() => navigate('/feed')}
                        className="text-white text-sm tracking-widest px-9 py-3 cursor-pointer transition-all hover:-translate-y-px bg-pulse border-none rounded-half"
                    >
                        Go to feed
                    </button>
                </>
            ) : (
                <>
                <h2
                    className="text-section leading-none tracking-display text-white font-extrabold mb-6"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                >
                    Ready to<br />connect?
                </h2>
                    <p
                        className="text-base font-light leading-loose mb-10 md:mb-12 max-w-sm mx-auto"
                        style={{ color: 'rgba(255,255,255,0.38)' }}
                    >
                        Sign up and join a community network built on distributed infrastructure.
                    </p>
                    <button
                        onClick={() => navigate('/register')}
                        className="text-white text-sm tracking-widest px-9 py-3 cursor-pointer transition-all hover:-translate-y-px bg-pulse border-none rounded-half"
                    >
                        Create an account
                    </button>
                </>
            )}
        </section>
    );
}