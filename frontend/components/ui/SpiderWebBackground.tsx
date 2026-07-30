'use client';
// components/ui/SpiderWebBackground.tsx
// Animated spider-web SVG background with floating particles

import { useEffect, useRef } from 'react';

interface SpiderWebBackgroundProps {
  intensity?: 'subtle' | 'normal' | 'strong';
  className?: string;
}

export default function SpiderWebBackground({
  intensity = 'normal',
  className = '',
}: SpiderWebBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const opacityMap = { subtle: 0.08, normal: 0.15, strong: 0.25 };
  const baseOpacity = opacityMap[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle system
    const particles: { x: number; y: number; size: number; speed: number; opacity: number; hue: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.4 + 0.1,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.8 ? 200 : 0, // mostly crimson, some electric blue
      });
    }

    // Web hub points
    const hubs = [
      { x: 0.15, y: 0.1 },
      { x: 0.85, y: 0.1 },
      { x: 0.05, y: 0.6 },
      { x: 0.95, y: 0.55 },
      { x: 0.5,  y: 0.02 },
      { x: 0.3,  y: 0.95 },
      { x: 0.75, y: 0.92 },
    ];

    const drawWeb = (w: number, h: number, time: number) => {
      ctx.clearRect(0, 0, w, h);

      // Background fog blobs
      const fogGradient1 = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, w * 0.4);
      fogGradient1.addColorStop(0, `rgba(139, 0, 0, ${baseOpacity * 0.4})`);
      fogGradient1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fogGradient1;
      ctx.fillRect(0, 0, w, h);

      const fogGradient2 = ctx.createRadialGradient(w * 0.85, h * 0.5, 0, w * 0.85, h * 0.5, w * 0.3);
      fogGradient2.addColorStop(0, `rgba(79, 195, 247, ${baseOpacity * 0.15})`);
      fogGradient2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = fogGradient2;
      ctx.fillRect(0, 0, w, h);

      // Draw web threads between hubs
      ctx.lineWidth = 0.5;
      for (let i = 0; i < hubs.length; i++) {
        for (let j = i + 1; j < hubs.length; j++) {
          const x1 = hubs[i].x * w;
          const y1 = hubs[i].y * h;
          const x2 = hubs[j].x * w;
          const y2 = hubs[j].y * h;
          const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          if (dist > w * 0.6) continue;

          const alpha = baseOpacity * (0.6 + 0.4 * Math.sin(time * 0.5 + i + j));
          const grad = ctx.createLinearGradient(x1, y1, x2, y2);
          grad.addColorStop(0, `rgba(220,20,60,${alpha})`);
          grad.addColorStop(0.5, `rgba(139,0,0,${alpha * 0.7})`);
          grad.addColorStop(1, `rgba(220,20,60,${alpha})`);
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          // Slight curve
          const mx = (x1 + x2) / 2 + Math.sin(time * 0.3 + i) * 20;
          const my = (y1 + y2) / 2 + Math.cos(time * 0.3 + j) * 20;
          ctx.quadraticCurveTo(mx, my, x2, y2);
          ctx.stroke();
        }
      }

      // Radial web rings from primary hub (top center)
      const cx = w * 0.5;
      const cy = -h * 0.1;
      const maxR = h * 1.2;
      for (let r = 80; r < maxR; r += 120) {
        const alpha = baseOpacity * (1 - r / maxR) * (0.5 + 0.5 * Math.sin(time * 0.4));
        ctx.strokeStyle = `rgba(220,20,60,${alpha})`;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Web radial spokes from top
      for (let angle = 0; angle < Math.PI; angle += Math.PI / 10) {
        const alpha = baseOpacity * (0.4 + 0.3 * Math.sin(time * 0.3 + angle));
        ctx.strokeStyle = `rgba(220,20,60,${alpha})`;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
        ctx.stroke();
      }

      // Glow nodes at intersections
      hubs.forEach((hub, i) => {
        const x = hub.x * w;
        const y = hub.y * h;
        const pulse = 0.5 + 0.5 * Math.sin(time * 1.2 + i * 0.8);
        const nodeGrad = ctx.createRadialGradient(x, y, 0, x, y, 8 + pulse * 4);
        nodeGrad.addColorStop(0, `rgba(220,20,60,${baseOpacity * 2})`);
        nodeGrad.addColorStop(1, 'rgba(220,20,60,0)');
        ctx.fillStyle = nodeGrad;
        ctx.beginPath();
        ctx.arc(x, y, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particles
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(time * 0.5 + p.y * 0.01) * 0.3;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }

        const c = p.hue === 200 ? '79,195,247' : '220,20,60';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c},${p.opacity})`;
        ctx.fill();
      });

      // Glowing network lines (random, subtle)
      ctx.lineWidth = 0.2;
      for (let i = 0; i < 8; i++) {
        const x1 = (Math.sin(time * 0.1 + i * 0.9) * 0.5 + 0.5) * w;
        const y1 = (Math.cos(time * 0.1 + i * 1.1) * 0.5 + 0.5) * h;
        const x2 = (Math.sin(time * 0.08 + i * 1.3 + 2) * 0.5 + 0.5) * w;
        const y2 = (Math.cos(time * 0.09 + i * 0.7 + 1) * 0.5 + 0.5) * h;
        const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        if (dist > 400) continue;
        ctx.strokeStyle = `rgba(220,20,60,${baseOpacity * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    const animate = () => {
      t += 0.008;
      drawWeb(canvas.width, canvas.height, t);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [baseOpacity]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 1 }}
      />
    </div>
  );
}
