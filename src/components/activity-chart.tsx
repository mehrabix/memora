import type { ActivityPoint } from "@/src/lib/stats";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function label(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  return WEEKDAYS[d.getUTCDay()];
}

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-40 items-end gap-1.5">
      {data.map((point) => {
        const height = point.count === 0 ? 4 : Math.round((point.count / max) * 100);
        return (
          <div
            key={point.date}
            className="flex flex-1 flex-col items-center justify-end gap-1"
            title={`${point.date}: ${point.count} review${point.count === 1 ? "" : "s"}`}
          >
            <div
              className="w-full rounded-sm bg-primary/70 transition-all"
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-muted-foreground">
              {label(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
