export type Sm2Input = {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
};

export type Sm2Result = {
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string; // ISO
};

const MIN_EASE = 1.3;

/**
 * SuperMemo-2 spaced repetition scheduling.
 * @param quality recall quality 0-5 (0/1 blackout, 2 wrong, 3 hard, 4 good, 5 perfect)
 */
export function sm2(
  { easeFactor, interval, repetitions }: Sm2Input,
  quality: number,
  now: Date = new Date()
): Sm2Result {
  let nextInterval: number;
  let nextRepetitions: number;

  if (quality >= 3) {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions = repetitions + 1;
  } else {
    nextRepetitions = 0;
    nextInterval = 1;
  }

  let nextEase =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  nextEase = Math.max(MIN_EASE, Math.round(nextEase * 100) / 100);

  const due = new Date(now);
  due.setDate(due.getDate() + nextInterval);

  return {
    easeFactor: nextEase,
    interval: nextInterval,
    repetitions: nextRepetitions,
    dueDate: due.toISOString(),
  };
}

export const RATINGS = [
  { quality: 0, label: "Again", variant: "destructive" as const },
  { quality: 3, label: "Hard", variant: "outline" as const },
  { quality: 4, label: "Good", variant: "default" as const },
  { quality: 5, label: "Easy", variant: "secondary" as const },
];
