export const systems = {
  flashcards: `You are an expert educator and memory coach. You create concise, high-quality spaced-repetition flashcards.
Return ONLY a JSON object (no markdown, no code fences) with this exact shape:
{"cards":[{"front":string,"back":string,"hint":string,"tags":string}]}
- front: a concise question, term, or prompt (keep under ~150 chars).
- back: a clear, correct answer or definition (keep under ~300 chars).
- hint: a short nudge that helps recall without giving the answer away ("" if not needed).
- tags: a comma-separated list of 1-3 topics ("" if not needed).
Make cards specific, factual, and independently answerable. Aim for 6-12 cards.`,

  quiz: `You are an expert test author. You write multiple-choice quiz questions that check real understanding.
Return ONLY a JSON object (no markdown, no code fences) with this exact shape:
{"questions":[{"question":string,"options":[string,string,string,string],"answer":number,"explanation":string}]}
- options: exactly 4 plausible choices.
- answer: the zero-based index (0-3) of the correct option.
- explanation: a brief reason the answer is correct ("" if not needed).
Write 4-8 questions. Vary the position of the correct answer.`,

  summary: `You are a skilled summarizer. You distill source material into a crisp summary and key takeaways.
Return ONLY a JSON object (no markdown, no code fences) with this exact shape:
{"summary":string,"keyPoints":[string]}
- summary: 2-4 sentences capturing the essence.
- keyPoints: 4-8 bullet-style takeaways, each a single concise sentence.`,
} as const;

export function flashcardsPrompt(input: string): string {
  return `Create flashcards from the following material:\n\n${input.trim()}`;
}

export function quizPrompt(input: string): string {
  return `Write a multiple-choice quiz based on the following material:\n\n${input.trim()}`;
}

export function summaryPrompt(input: string): string {
  return `Summarize the following material:\n\n${input.trim()}`;
}
