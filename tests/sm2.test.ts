import { describe, it, expect } from "vitest";
import { sm2, RATINGS } from "@/src/lib/sm2";

describe("sm2", () => {
  const now = new Date("2024-01-01T00:00:00Z");

  it("schedules the first correct review 1 day out", () => {
    const r = sm2({ easeFactor: 2.5, interval: 0, repetitions: 0 }, 4, now);
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(1);
  });

  it("schedules the second correct review 6 days out", () => {
    const r = sm2({ easeFactor: 2.5, interval: 1, repetitions: 1 }, 4, now);
    expect(r.interval).toBe(6);
    expect(r.repetitions).toBe(2);
  });

  it("multiplies the interval by the ease factor on later reviews", () => {
    const r = sm2({ easeFactor: 2.5, interval: 6, repetitions: 2 }, 5, now);
    expect(r.interval).toBe(15); // 6 * 2.5
    expect(r.easeFactor).toBeGreaterThan(2.5);
  });

  it("resets repetitions and schedules 1 day on an incorrect review", () => {
    const r = sm2({ easeFactor: 2.5, interval: 30, repetitions: 5 }, 1, now);
    expect(r.repetitions).toBe(0);
    expect(r.interval).toBe(1);
  });

  it("never lets the ease factor drop below 1.3", () => {
    const r = sm2({ easeFactor: 1.3, interval: 1, repetitions: 1 }, 0, now);
    expect(r.easeFactor).toBe(1.3);
  });

  it("computes the due date as interval days from now", () => {
    const r = sm2({ easeFactor: 2.5, interval: 0, repetitions: 0 }, 4, now);
    expect(r.dueDate).toBe(new Date("2024-01-02T00:00:00Z").toISOString());
  });

  it("exposes four rating buttons in order", () => {
    expect(RATINGS).toHaveLength(4);
    expect(RATINGS.map((r) => r.label)).toEqual([
      "Again",
      "Hard",
      "Good",
      "Easy",
    ]);
  });
});
