import { useEffect, useRef, useState } from "react";

const W = 360;
const H = 480;

export function RacerGame() {
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
    let dead = false;
    let x = W / 2;
    let dir = 0;
    let dist = 0;
    let speed = 4;
    const carW = 34;
    const carH = 56;
    const lanes = [W * 0.25, W * 0.5, W * 0.75];
    const traffic: { x: number; y: number }[] = [
      { x: lanes[1]!, y: -100 },
      { x: lanes[0]!, y: -320 },
    ];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") dir = -1;
      if (e.code === "ArrowRight") dir = 1;
    };
    const onKeyUp = () => {
      dir = 0;
    };
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      dir = e.clientX - rect.left < rect.width / 2 ? -1 : 1;
    };
    const stop = () => {
      dir = 0;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointerleave", stop);

    const css = getComputedStyle(document.documentElement);
    const c = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;

    const loop = () => {
      x = Math.max(30, Math.min(W - 30, x + dir * 4.5));
      dist += speed;
      speed = 4 + Math.min(4, dist / 3000);
      setScore(Math.floor(dist / 20));

      for (const t of traffic) {
        t.y += speed;
        if (t.y > H + 80) {
          t.y = -120 - Math.random() * 220;
          t.x = lanes[Math.floor(Math.random() * lanes.length)]!;
        }
        if (Math.abs(t.x - x) < carW && Math.abs(t.y - (H - 90)) < carH) dead = true;
      }

      ctx.fillStyle = c("--color-card", "#111");
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = c("--color-muted", "#333");
      ctx.fillRect(40, 0, W - 80, H);
      ctx.fillStyle = c("--color-muted-foreground", "#888");
      for (let i = -1; i < 10; i++) {
        const y = ((i * 60 + dist) % (H + 60)) - 60;
        ctx.fillRect(W / 2 - 3, y, 6, 30);
      }
      const drawBuilding = (bx: number, by: number) => {
        const w = carW;
        const h = carH;
        const left = bx - w / 2;
        const top = by - h / 2;
        ctx.fillStyle = c("--color-destructive", "#e33");
        ctx.fillRect(left, top + 8, w, h - 8);
        // roof block
        ctx.fillRect(left + w * 0.25, top, w * 0.5, 8);
        // windows
        ctx.fillStyle = c("--color-card", "#111");
        for (let r = 0; r < 3; r++) {
          for (let col = 0; col < 2; col++) {
            ctx.fillRect(left + 6 + col * (w / 2), top + 14 + r * 13, w / 2 - 10, 8);
          }
        }
      };

      const drawCar = (cx: number, cy: number) => {
        const w = carW;
        const h = carH;
        const left = cx - w / 2;
        const top = cy - h / 2;
        // wheels
        ctx.fillStyle = c("--color-foreground", "#eee");
        ctx.fillRect(left - 3, top + h * 0.18, 4, h * 0.2);
        ctx.fillRect(left + w - 1, top + h * 0.18, 4, h * 0.2);
        ctx.fillRect(left - 3, top + h * 0.62, 4, h * 0.2);
        ctx.fillRect(left + w - 1, top + h * 0.62, 4, h * 0.2);
        // body
        ctx.fillStyle = c("--color-primary", "#6cf");
        ctx.beginPath();
        ctx.moveTo(left + w * 0.5, top);
        ctx.lineTo(left + w * 0.9, top + h * 0.22);
        ctx.lineTo(left + w, top + h * 0.62);
        ctx.lineTo(left + w * 0.86, top + h);
        ctx.lineTo(left + w * 0.14, top + h);
        ctx.lineTo(left, top + h * 0.62);
        ctx.lineTo(left + w * 0.1, top + h * 0.22);
        ctx.closePath();
        ctx.fill();
        // windshield
        ctx.fillStyle = c("--color-card", "#111");
        ctx.beginPath();
        ctx.moveTo(left + w * 0.5, top + h * 0.14);
        ctx.lineTo(left + w * 0.82, top + h * 0.34);
        ctx.lineTo(left + w * 0.18, top + h * 0.34);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(left + w * 0.2, top + h * 0.62, w * 0.6, h * 0.16);
      };

      for (const t of traffic) drawBuilding(t.x, t.y);
      drawCar(x, H - 90);

      if (dead) {
        setOver(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointer);
      canvas.removeEventListener("pointerup", stop);
      canvas.removeEventListener("pointerleave", stop);
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
        <span>Arrow keys or tap left/right</span>
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
