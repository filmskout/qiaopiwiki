import knowledge from "@/data/knowledge.json";
import type { KnowledgeFragment } from "./types";

const FRAGMENTS = knowledge as KnowledgeFragment[];

/** Simple bilingual tokenizer: split on CJK chars individually + latin word runs. */
function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const latinWords = text.match(/[a-zA-Z0-9]+/g) ?? [];
  tokens.push(...latinWords.map((w) => w.toLowerCase()));
  const cjk = text.match(/[一-鿿]/g) ?? [];
  tokens.push(...cjk);
  // also push bigrams of adjacent CJK chars to catch 2-char terms like 水客/批局
  for (let i = 0; i < cjk.length - 1; i++) {
    tokens.push(cjk[i] + cjk[i + 1]);
  }
  return tokens;
}

function scoreFragment(queryTokens: string[], frag: KnowledgeFragment): number {
  const haystack = tokenize(`${frag.zh} ${frag.en} ${frag.tags.join(" ")}`);
  const haystackSet = new Set(haystack);
  let score = 0;
  for (const t of queryTokens) {
    if (haystackSet.has(t)) {
      // weight tag matches and longer tokens higher
      score += t.length >= 2 ? 2 : 1;
    }
  }
  // small bonus for tag exact matches
  for (const tag of frag.tags) {
    if (queryTokens.includes(tag.toLowerCase())) score += 3;
  }
  return score;
}

/** Keyword retrieval: tokenize query, score against zh+en+tags, return top N. */
export function retrieveFragments(question: string, topN = 6): KnowledgeFragment[] {
  const qTokens = tokenize(question);
  if (qTokens.length === 0) return FRAGMENTS.slice(0, topN);

  const scored = FRAGMENTS.map((f) => ({ f, score: scoreFragment(qTokens, f) }));
  scored.sort((a, b) => b.score - a.score);

  const nonZero = scored.filter((s) => s.score > 0);
  const pool = nonZero.length >= topN ? nonZero : scored;
  return pool.slice(0, topN).map((s) => s.f);
}

export function getFragmentById(id: string): KnowledgeFragment | undefined {
  return FRAGMENTS.find((f) => f.id === id);
}

export function allFragments(): KnowledgeFragment[] {
  return FRAGMENTS;
}
