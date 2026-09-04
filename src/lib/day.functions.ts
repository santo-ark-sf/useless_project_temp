import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export type DayAnswer = {
  isTuesday: boolean;
  timezone: string;
  weekday: string;
};

export const getIsTuesday = createServerFn({ method: "GET" }).handler(async (): Promise<DayAnswer> => {
  const tz =
    getRequestHeader("cf-timezone") ??
    getRequestHeader("x-vercel-ip-timezone") ??
    "UTC";

  let timezone = tz;
  let weekday = "";
  try {
    weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: timezone }).format(new Date());
  } catch {
    timezone = "UTC";
    weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date());
  }

  return { isTuesday: weekday === "Tuesday", timezone, weekday };
});
