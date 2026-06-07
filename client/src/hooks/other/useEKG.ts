import { useCallback, useRef } from 'react';



const SCROLL_SPEED = 1.4;



function ekgY(x: number, offset: number, amplitude: number, centerY: number, W: number, beatsPerWidth: number) {
    const pos = ((x + offset) % W + W) % W;
    const beat = (pos / W * beatsPerWidth) % 1;

    let y = 0;
    if (beat < 0.04) y = -amplitude * 0.15 * Math.sin(beat / 0.04 * Math.PI);
    else if (beat < 0.08) y = amplitude * 0.12 * Math.sin((beat - 0.04) / 0.04 * Math.PI);
    else if (beat < 0.11) y = -amplitude * 0.7 * Math.sin((beat - 0.08) / 0.03 * Math.PI);
    else if (beat < 0.16) y = amplitude * 2.8 * Math.sin((beat - 0.11) / 0.05 * Math.PI);
    else if (beat < 0.21) y = -amplitude * 0.55 * Math.sin((beat - 0.16) / 0.05 * Math.PI);
    else if (beat < 0.27) y = -amplitude * 0.25 * Math.sin((beat - 0.21) / 0.06 * Math.PI);
    else if (beat < 0.34) y = amplitude * 0.35 * Math.sin((beat - 0.27) / 0.07 * Math.PI);

    return centerY + y;
}

export function useEKG(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    W: number,
    H: number
) {
    const offsetRef = useRef(0);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !W || !H) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { beatsPerWidth, glowHalfWidth, amplitude: amp, step } = getResponsiveParams(W);

        ctx.clearRect(0, 0, W, H);
        const cy = H * 0.76;
        const lineOffset = offsetRef.current * 0.7;

        // Base trace
        ctx.beginPath();
        for (let x = 0; x <= W; x += step) {
            const y = ekgY(x, lineOffset, amp, cy, W, beatsPerWidth);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(108,99,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow pass
        ctx.beginPath();
        for (let x = 0; x <= W; x += step) {
            const y = ekgY(x, lineOffset, amp, cy, W, beatsPerWidth);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(108,99,255,0.12)';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Travelling highlight  use responsive glow width
        const gx = (lineOffset * 1.3) % W;
        const xStart = Math.max(0, gx - glowHalfWidth);
        const xEnd = Math.min(W, gx + glowHalfWidth);

        const grad = ctx.createLinearGradient(gx - glowHalfWidth, 0, gx + glowHalfWidth, 0);
        grad.addColorStop(0, 'rgba(108,99,255,0)');
        grad.addColorStop(0.45, 'rgba(160,154,255,0.25)');
        grad.addColorStop(0.5, 'rgba(200,196,255,0.7)');
        grad.addColorStop(0.55, 'rgba(160,154,255,0.25)');
        grad.addColorStop(1, 'rgba(108,99,255,0)');

        ctx.beginPath();
        for (let x = xStart; x <= xEnd; x += 2) {
            const y = ekgY(x, lineOffset, amp, cy, W, beatsPerWidth);
            if (x === xStart) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.stroke();

        offsetRef.current += SCROLL_SPEED;
    }, [canvasRef, W, H]);

    return { draw };
}


function getResponsiveParams(W: number) {
    const t = Math.min(1, Math.max(0, (W - 320) / (1200 - 320))); // 0 at 320px, 1 at 1200px
    return {
        beatsPerWidth: Math.round(2 + t * 4),       // 2 → 6
        glowHalfWidth: Math.round(50 + t * 90),     // 50 → 140
        amplitude: Math.round(14 + t * 14),          // 14 → 28
        step: W < 768 ? 1 : 2,
    };
}
