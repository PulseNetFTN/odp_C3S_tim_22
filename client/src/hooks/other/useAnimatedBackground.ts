import { useRef, useState, useEffect } from 'react';
import { useParticles } from './useParticles';
import { useEKG } from './useEKG';

export type EkgMode = 'fullpage' | 'centered';

export interface AnimatedBackgroundRefs {
    pCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    ekgWrapRef: React.RefObject<HTMLDivElement | null>;
    eCanvasRef: React.RefObject<HTMLCanvasElement | null>;
    mounted: boolean;
}

export function useAnimatedBackground(ekgMode: EkgMode = 'fullpage'): AnimatedBackgroundRefs {
    void ekgMode;
    const pCanvasRef = useRef<HTMLCanvasElement>(null);
    const ekgWrapRef = useRef<HTMLDivElement>(null);
    const eCanvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef<{ x: number; y: number } | null>(null);

    const [pDims, setPDims] = useState({ W: 0, H: 0 });
    const [ekgDims, setEkgDims] = useState({ W: 0, H: 0 });
    const [mounted, setMounted] = useState(false);

    const { draw: drawParticles } = useParticles(pCanvasRef, mouseRef, pDims.W, pDims.H);
    const { draw: drawEKG } = useEKG(eCanvasRef, ekgDims.W, ekgDims.H);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);

        function resize() {
        const dpr = window.devicePixelRatio || 1;
        const W = window.innerWidth;
        const H = window.innerHeight;

        if (pCanvasRef.current) {
            pCanvasRef.current.width = W * dpr;
            pCanvasRef.current.height = H * dpr;
            const ctx = pCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset + scale in one call
            }
        }
        setPDims({ W, H });

        if (ekgWrapRef.current && eCanvasRef.current) {
            const ekgH = ekgWrapRef.current.offsetHeight;
            eCanvasRef.current.width = W * dpr;
            eCanvasRef.current.height = ekgH * dpr;
            const ctx = eCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            setEkgDims({ W, H: ekgH });
        }
    }

        resize();
        window.addEventListener('resize', resize);

        const observer = new ResizeObserver(() => {
            if (!ekgWrapRef.current || !eCanvasRef.current) return;
            const dpr = window.devicePixelRatio || 1;
            const W = window.innerWidth;
            const ekgH = ekgWrapRef.current.offsetHeight;
            eCanvasRef.current.width = W * dpr;
            eCanvasRef.current.height = ekgH * dpr;
            const ctx = eCanvasRef.current.getContext('2d');
            if (ctx) {
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            setEkgDims({ W, H: ekgH });
        });
        if (ekgWrapRef.current) observer.observe(ekgWrapRef.current);

        const onMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        const onMouseLeave = () => { mouseRef.current = null; };
        window.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseleave', onMouseLeave);

        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseleave', onMouseLeave);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!pDims.W || !pDims.H) return;
        let animFrame: number;
        function loop() {
            drawParticles();
            drawEKG();
            animFrame = requestAnimationFrame(loop);
        }
        animFrame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrame);
    }, [pDims, ekgDims, drawParticles, drawEKG]);

    return { pCanvasRef, ekgWrapRef, eCanvasRef, mounted };
}