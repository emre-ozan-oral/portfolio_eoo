"use client";
import { useEffect, useRef } from "react";

type Pt = { x: number; y: number; vx: number; vy: number; r: number };

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.trim().replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const int = parseInt(full || "D4A847", 16);
  if (Number.isNaN(int)) return [212, 168, 71];
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

export default function NeuralNet({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let W = 0, H = 0;
    const MAX_D = 160;
    const pts: Pt[] = [];

    let rgb: [number, number, number] = [212, 168, 71];
    const readAccent = () => {
      const val = getComputedStyle(document.documentElement).getPropertyValue("--accent");
      if (val) rgb = hexToRgb(val);
    };
    readAccent();

    const themeObserver = new MutationObserver(readAccent);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const setup = () => {
      W = canvas.offsetWidth || window.innerWidth;
      H = canvas.offsetHeight || window.innerHeight;
      canvas.width = W;
      canvas.height = H;

      // Fewer particles on small screens — keeps it a quiet backdrop, not a
      // battery/CPU drain on mobile.
      const count = W < 640 ? 20 : W < 1024 ? 30 : 42;

      pts.length = 0;
      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.4 + 0.4,
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MAX_D * MAX_D) {
            const t = 1 - Math.sqrt(d2) / MAX_D;
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(t * t * 0.13).toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.28)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      if (document.visibilityState === "visible") {
        for (const p of pts) {
          p.x = ((p.x + p.vx) + W) % W;
          p.y = ((p.y + p.vy) + H) % H;
        }
        render();
      }
      raf = requestAnimationFrame(step);
    };

    setup();

    if (reduceMotion) {
      // Draw a single static frame and leave it there.
      render();
    } else {
      raf = requestAnimationFrame(step);
    }

    const onResize = () => setup();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
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
