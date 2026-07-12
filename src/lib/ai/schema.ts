import { z } from "zod";

export const cardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  hint: z.string().optional().default(""),
  tags: z.string().optional().default(""),
});

export const flashcardsSchema = z.object({
  cards: z.array(cardSchema).min(1).max(50),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  answer: z.number().int().min(0).max(3),
  explanation: z.string().optional().default(""),
});

export const quizSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1).max(25),
});

export const summarySchema = z.object({
  summary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)),
});

export type Card = z.infer<typeof cardSchema>;
export type Flashcards = z.infer<typeof flashcardsSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type Summary = z.infer<typeof summarySchema>;
