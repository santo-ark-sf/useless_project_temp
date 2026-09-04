import { useEffect, useRef, useState } from "react";

const W = 360;
const H = 480;

export function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let y = H / 2;
    let vy = 0;
    let dead = false;
    let localScore = 0;
    const gap = 140;
    const pipes: { x: number; top: number; scored: boolean }[] = [
      { x: W + 80, top: 120, scored: false },
      { x: W + 80 + 200, top: 200, scored: false },
    ];

    const flap = () => {
      if (dead) return;
      vy = -6.2;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    canvas.addEventListener("pointerdown", flap);
    window.addEventListener("keydown", onKey);

    const css = getComputedStyle(document.documentElement);
    const c = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;

    const loop = () => {
      vy += 0.35;
      y += vy;

      for (const p of pipes) {
        p.x -= 2.4;
        if (p.x < -60) {
          p.x += 400;
          p.top = 80 + Math.random() * (H - gap - 180);
          p.scored = false;
        }
        if (!p.scored && p.x + 52 < 80) {
          p.scored = true;
          localScore += 1;
          setScore(localScore);
        }
        const hitX = 80 + 16 > p.x && 80 - 16 < p.x + 52;
        if (hitX && (y - 14 < p.top || y + 14 > p.top + gap)) dead = true;
      }
      if (y > H - 14 || y < 0) dead = true;

      ctx.fillStyle = c("--color-card", "#111");
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = c("--color-primary", "#6cf");
      for (const p of pipes) {
        ctx.fillRect(p.x, 0, 52, p.top);
        ctx.fillRect(p.x, p.top + gap, 52, H - p.top - gap);
      }
      ctx.fillStyle = c("--color-accent-foreground", "#fff");
      ctx.beginPath();
      ctx.arc(80, y, 14, 0, Math.PI * 2);
      ctx.fill();

      if (dead) {
        setOver(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", flap);
      window.removeEventListener("keydown", onKey);
    };
  }, [runKey]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="max-w-full rounded-xl border border-border touch-none"
      />
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Score {score}</span>
        <span>Tap or press Space to flap</span>
      </div>
      {over && (
        <button
          onClick={() => {
            setOver(false);
            setScore(0);
            setRunKey((k) => k + 1);
          }}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Play again
        </button>
      )}
    </div>
  );
}
