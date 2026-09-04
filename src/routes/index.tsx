import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getIsTuesday } from "@/lib/day.functions";
import { FlappyGame } from "@/components/FlappyGame";
import { RacerGame } from "@/components/RacerGame";

export const Route = createFileRoute("/")({
  loader: () => getIsTuesday(),
  head: () => ({
    meta: [
      { title: "Is it Tuesday? — One word answer" },
      {
        name: "description",
        content:
          "A full-screen YES or NO, answered from your own timezone on the server. Plus a bonus mini game: flappy on Tuesdays, car racing every other day.",
      },
      { property: "og:title", content: "Is it Tuesday?" },
      {
        property: "og:description",
        content: "Full-screen YES or NO based on your local timezone, with a hidden mini game.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { isTuesday, timezone, weekday } = Route.useLoaderData();
  const [playing, setPlaying] = useState(false);

  const answer = isTuesday ? "YES" : "NO";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <h1
        className="select-none text-center font-display leading-none tracking-tighter"
        style={{
          fontSize: "clamp(6rem, 34vw, 24rem)",
          color: isTuesday ? "var(--color-yes)" : "var(--color-no)",
        }}
      >
        {answer}
      </h1>

      <p className="mt-4 text-center text-sm uppercase tracking-[0.35em] text-muted-foreground">
        It&apos;s {weekday} · {timezone}
      </p>

      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-105"
        >
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-full bg-primary-foreground/15"
          >
            ▶
          </span>
          Play {isTuesday ? "flappy" : "racer"}
        </button>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-4">
          {isTuesday ? <FlappyGame /> : <RacerGame />}
          <button
            onClick={() => setPlaying(false)}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Close game
          </button>
        </div>
      )}
    </main>
  );
}
