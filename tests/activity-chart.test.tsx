// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityChart } from "@/src/components/activity-chart";
import type { ActivityPoint } from "@/src/lib/stats";

const data: ActivityPoint[] = [
  { date: "2024-01-01", count: 0 },
  { date: "2024-01-02", count: 3 },
  { date: "2024-01-03", count: 1 },
  { date: "2024-01-04", count: 0 },
];

describe("ActivityChart", () => {
  it("renders one bar per day", () => {
    render(<ActivityChart data={data} />);
    const bars = screen.getAllByTitle(/review/);
    expect(bars).toHaveLength(data.length);
  });

  it("shows the count for days with activity", () => {
    render(<ActivityChart data={data} />);
    expect(screen.getByTitle("2024-01-02: 3 reviews")).toBeInTheDocument();
    expect(screen.getByTitle("2024-01-03: 1 review")).toBeInTheDocument();
  });

  it("renders weekday labels", () => {
    render(<ActivityChart data={data} />);
    // 2024-01-01 is a Monday
    expect(screen.getByText("Mon")).toBeInTheDocument();
  });
});
