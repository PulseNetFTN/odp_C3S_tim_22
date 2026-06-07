import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement>(threshold = 0.12) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        el.classList.add('reveal-section');

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('reveal-section--visible');
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return ref;
}