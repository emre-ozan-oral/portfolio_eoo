"use client";
import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; vx: number; vy: number; r: number };

export default function NeuralNet({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0;
    const COUNT = 42;
    const MAX_D = 160;
    const pts: Pt[] = [];

    const setup = () => {
      W = canvas.offsetWidth || window.innerWidth;
      H = canvas.offsetHeight || window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      pts.length = 0;
      for (let i = 0; i < COUNT; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.4 + 0.4,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Move particles (wrap around edges)
      for (const p of pts) {
        p.x = ((p.x + p.vx) + W) % W;
        p.y = ((p.y + p.vy) + H) % H;
      }

      // Draw edges
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MAX_D * MAX_D) {
            const t = 1 - Math.sqrt(d2) / MAX_D;
            ctx.strokeStyle = `rgba(212,168,71,${(t * t * 0.13).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of pts) {
        ctx.fillStyle = "rgba(212,168,71,0.28)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => setup();
    setup();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      aria-hidden
    />
  );
}
