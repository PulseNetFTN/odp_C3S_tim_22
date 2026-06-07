import { useEffect, useRef, useState } from 'react';
import LandingNav from '../../components/landing/LandingNav';
import LandingHero from '../../components/landing/LandingHero';
import LandingStats from '../../components/landing/LandingStats';
import LandingFeatures from '../../components/landing/LandingFeatures';
import LandingRoles from '../../components/landing/LandingRoles';
import LandingCTA from '../../components/landing/LandingCta';
import LandingFooter from '../../components/landing/LandingFooter';
import { useAuth } from '../../hooks/auth/useAuthHook';
import { useAnimatedBackground } from '../../hooks/other/useAnimatedBackground';
import handImg from '../../assets/pointing-hand.png';

export default function LandingPage() {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressGlowRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        let animFrame: number;
        let cancalled = false;

        const cancel = () => {
            cancalled = true;
            cancelAnimationFrame(animFrame);
        };

        window.addEventListener('wheel',      cancel, { once: true });
        window.addEventListener('touchstart', cancel, { once: true });
        window.addEventListener('keydown',    cancel, { once: true });
        window.addEventListener('mousedown',  cancel, { once: true });
    const startTimeout = setTimeout(() => {
        if (cancalled) return;
        const drift = () => {
            if(cancalled) return;
            window.scrollBy(0, 0.7);
            animFrame = requestAnimationFrame(drift);
        };

        animFrame = requestAnimationFrame(drift);
    }, 3400);

        return () => {
            clearTimeout(startTimeout);
            cancelAnimationFrame(animFrame);
            window.removeEventListener('wheel',      cancel);
            window.removeEventListener('touchstart', cancel);
            window.removeEventListener('keydown',    cancel);
            window.removeEventListener('mousedown',  cancel);
        };    
    }, []);


    useEffect(() => {
        const onScroll = () => {
            const max = document.body.scrollHeight - window.innerHeight;
            const pct = max > 0 ? (window.scrollY / max) * 100 : 0;

            if (progressBarRef.current)  progressBarRef.current.style.width = pct + '%';
            if (progressGlowRef.current) progressGlowRef.current.style.left  = `calc(${pct}% - 6px)`;
            setScrolled(pct > 3);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);  

    const { user } = useAuth();
    const { pCanvasRef, ekgWrapRef, eCanvasRef } = useAnimatedBackground('fullpage');

    return (
        <div
            className="relative overflow-hidden min-h-screen bg-surface-base text-muted font-dm"
        >
            

            <canvas
                ref={pCanvasRef}
                className="fixed top-0 left-0 w-full pointer-events-none"
                style={{ zIndex: 0, height: '100vh' }}
            />

            <img
                src={handImg}
                alt=""
                className="hidden [@media(min-width:1800px)]:block absolute top-0 right-0 w-[1100px] pointer-events-none select-none"
                style={{
                    filter: 'brightness(0.4) sepia(1) saturate(3) hue-rotate(220deg) brightness(1.2)',
                    maskImage: 'linear-gradient(to bottom left, transparent 5%, black 35%)',
                    WebkitMaskImage: 'linear-gradient(to bottom left, transparent 5%, black 35%)',
                    zIndex: 3,
                }}
            />

            <div className="relative" style={{ zIndex: 2 }}>
                <LandingNav />
                <LandingHero />
                {!user && (
                    <>
                        
                        <LandingStats />
                        <LandingFeatures />
                        <LandingRoles />
                    </>
                )}


                <div ref={ekgWrapRef} className="relative" >
                    <canvas 
                        
                        ref={eCanvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none "
                        style={{ zIndex: 0 }}
                    />
                    <div className="relative" style={{ zIndex: 1 }}>
                        <LandingCTA />
                    </div>
                </div>

                <LandingFooter />
        {/* Scroll progress line */}
        <div
            className="fixed bottom-0 left-0 w-full z-50 pointer-events-none"
            style={{ height: '2px', background: 'rgba(108,99,255,0.12)' }}
        >
            <div
                ref={progressBarRef}
                className="absolute top-0 left-0 h-full"
                style={{ width: '0%', background: 'linear-gradient(to right, rgba(108,99,255,0.5), #6c63ff)' }}
            />
            <div
                ref={progressGlowRef}
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-pulse scroll-indicator-glow"
                style={{ left: '-6px' }}
            />
        </div>

        {/* Scroll indicator / back to top */}
        <div
            className={`scroll-indicator-arrow${scrolled ? ' scrolled' : ''}`}
            onClick={scrolled ? () => window.scrollTo({ top: 0, behavior: 'smooth' }) : undefined}
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                    d={scrolled ? 'M4 13l6-6 6 6' : 'M4 7l6 6 6-6'}
                    stroke="#6c63ff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
</div>                
            </div>
        </div>
    );
}