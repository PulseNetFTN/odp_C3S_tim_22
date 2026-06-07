/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useRef } from 'react';

const REPEL_RADIUS = 130;
const REPEL_FORCE = 4.5;
const RETURN_SPEED = 0.045;
const FRICTION = 0.82;
const MAX_PARTICLES = 160;
const SHAPE_TYPES = ['circle', 'square', 'triangle', 'line'] as const;

type ShapeType = (typeof SHAPE_TYPES)[number];

interface Shape {
    ox: number; oy: number;
    x: number; y: number;
    vx: number; vy: number;
    size: number;
    type: ShapeType;
    rotation: number;
    rotSpeed: number;
    baseAlpha: number;
}

function drawShape(ctx: CanvasRenderingContext2D, s: Shape, alpha: number) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rotation);
    ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
    ctx.lineWidth = 1;

    if (s.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, s.size, 0, Math.PI * 2);
        ctx.stroke();
    } else if (s.type === 'square') {
        ctx.strokeRect(-s.size, -s.size, s.size * 2, s.size * 2);
    } else if (s.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(s.size, s.size);
        ctx.lineTo(-s.size, s.size);
        ctx.closePath();
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(-s.size, 0);
        ctx.lineTo(s.size, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(0, s.size);
        ctx.stroke();
    }

    ctx.restore();
}

export function useParticles(
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    mouseRef: React.RefObject<{ x: number; y: number } | null>,
    W: number,
    H: number
) {
    "use no memo";
    const shapesRef = useRef<Shape[]>([]);

    useEffect(() => {
        if (!W || !H) return;

        const count = Math.min(Math.floor((W * H) / 18000), MAX_PARTICLES);
        const shapes: Shape[] = [];

        for (let i = 0; i < count; i++) {
            const ox = Math.random() * W;
            const oy = Math.random() * H;
            shapes.push({
                ox, oy, x: ox, y: oy, vx: 0, vy: 0,
                size: Math.random() * 4 + 2,
                type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.01,
                baseAlpha: Math.random() * 0.12 + 0.04,
            });
        }

        shapesRef.current = shapes;
    }, [W, H]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, W, H);
        const mouse = mouseRef.current;

        for (const s of shapesRef.current) {
            // Mouse repulsion only when mouse is present
            let dist = Infinity;
            if (mouse) {
                const dx = mouse.x - s.x;
                const dy = mouse.y - s.y;
                dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < REPEL_RADIUS && dist > 0) {
                    const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
                    s.vx -= (dx / dist) * force * REPEL_FORCE;
                    s.vy -= (dy / dist) * force * REPEL_FORCE;
                }
            }

            // Spring back to origin + friction
            s.vx = (s.vx + (s.ox - s.x) * RETURN_SPEED) * FRICTION;
            s.vy = (s.vy + (s.oy - s.y) * RETURN_SPEED) * FRICTION;
            s.x += s.vx;
            s.y += s.vy;
            s.rotation += s.rotSpeed;

            // Alpha based on displacement and mouse proximity
            const dxO = s.x - s.ox;
            const dyO = s.y - s.oy;
            const displaced = Math.sqrt(dxO * dxO + dyO * dyO);
            const proximityBoost = mouse ? Math.max(0, 1 - dist / REPEL_RADIUS) : 0;
            const alpha = s.baseAlpha + proximityBoost * 0.5 + Math.min(displaced / 80, 0.3);

            drawShape(ctx, s, alpha);
        }
    }, [canvasRef, mouseRef, W, H]);

    return { draw };
}