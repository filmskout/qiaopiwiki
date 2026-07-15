"use client";

import Image from "next/image";
import { useState } from "react";
import { GonkaBadge, GonkaRequestEntry } from "@/components/GonkaBadge";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MusicToggle } from "@/components/MusicToggle";
import type { AskErrorResponse, AskResponse, VerifiedParagraph } from "@/lib/types";

const EMPTY_STATE_CARDS = [
  { src: "/art/accent-letters.webp", zh: "一封侨批的旅程", en: "The journey of a Qiaopi letter" },
  { src: "/art/accent-village.webp", zh: "侨乡的故事", en: "Stories from the hometown" },
  { src: "/art/accent-museum.webp", zh: "史料与见证", en: "Archives and witnesses" },
];

type Lang = "zh" | "en";

const PRESETS: { zh: string; en: string; lang: Lang }[] = [
  { zh: "什么是侨批？", en: "What are Qiaopi letters?", lang: "en" },
  { zh: "什么是水客？", en: "What is a shuike (courier)?", lang: "zh" },
  { zh: "侨批为什么入选世界记忆遗产？", en: "Why were Qiaopi inscribed on the UNESCO Memory of the World?", lang: "zh" },
  { zh: "潮汕侨批和五邑侨批有什么不同？", en: "How do Chaoshan and Wuyi Qiaopi differ?", lang: "zh" },
  { zh: "What is a piju (remittance house)?", en: "What is a piju (remittance house)?", lang: "en" },
  { zh: "汕头侨批文物馆是什么时候开馆的？", en: "When did the Shantou Qiaopi Museum open?", lang: "zh" },
  { zh: "Why did the Qiaopi trade decline after 1949?", en: "Why did the Qiaopi trade decline after 1949?", lang: "en" },
  { zh: "侨批体现了怎样的诚信文化？", en: "What trust culture do Qiaopi embody?", lang: "zh" },
];

const verdictColor: Record<VerifiedParagraph["verdict"], string> = {
  可溯源: "bg-green-100 text-green-800 border-green-300",
  部分不可溯源: "bg-yellow-100 text-yellow-800 border-yellow-300",
  不可溯源: "bg-red-100 text-red-800 border-red-300",
};

const verdictLabel: Record<VerifiedParagraph["verdict"], { zh: string; en: string }> = {
  可溯源: { zh: "可溯源", en: "Traceable" },
  部分不可溯源: { zh: "部分不可溯源", en: "Partially traceable" },
  不可溯源: { zh: "不可溯源", en: "Not traceable" },
};

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("zh");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [paragraphs, setParagraphs] = useState<VerifiedParagraph[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<GonkaRequestEntry[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  async function ask(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setParagraphs(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q, lang }),
      });
      const data = (await res.json()) as AskResponse | AskErrorResponse;
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Unknown error.");
        return;
      }
      setParagraphs(data.paragraphs);
      setEntries((prev) => [...prev, ...data.steps]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:py-10 md:px-8 pb-20">
      <div className="mx-auto max-w-3xl">
        <HeroCarousel
          lang={lang}
          onPickQuestion={(q) => {
            setQuestion(q);
            ask(q);
          }}
        />

        <div className="card p-4 sm:p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setLang("zh")}
                className={`chip px-4 py-2 text-sm min-h-[44px] ${lang === "zh" ? "!bg-accent !text-white" : ""}`}
              >
                中文
              </button>
              <button
                onClick={() => setLang("en")}
                className={`chip px-4 py-2 text-sm min-h-[44px] ${lang === "en" ? "!bg-accent !text-white" : ""}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="chip-scroll gap-2 mb-4 -mx-1 px-1">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(lang === "en" ? p.en : p.zh);
                  ask(lang === "en" ? p.en : p.zh);
                }}
                className="chip px-3 py-2 text-xs min-h-[44px]"
              >
                {p.zh === p.en ? p.zh : lang === "en" ? p.en : p.zh}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={lang === "en" ? "Ask about Qiaopi..." : "问问侨批的故事……"}
              className="flex-1 w-full rounded-full border border-[#d9c69a] bg-white px-4 py-3 sm:py-2 text-sm outline-none focus:border-accent min-h-[44px]"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full sm:w-auto px-5 py-3 sm:py-2 text-sm disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (lang === "en" ? "Asking…" : "查询中…") : lang === "en" ? "Ask" : "提问"}
            </button>
          </form>
        </div>

        {error && (
          <div className="card p-4 mb-6 border-red-300 bg-red-50 text-red-800 text-sm">{error}</div>
        )}

        {!paragraphs && !error && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {EMPTY_STATE_CARDS.map((c) => (
              <div key={c.src} className="card overflow-hidden">
                <div className="relative w-full h-36 sm:h-40">
                  <Image
                    src={c.src}
                    alt={c.zh}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <p className="zh-serif text-center text-xs sm:text-sm text-ink-soft py-2 px-2">
                  {lang === "en" ? c.en : c.zh}
                </p>
              </div>
            ))}
          </div>
        )}

        {paragraphs && (
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <div key={i} className="card p-4 sm:p-5">
                <p className="zh-serif text-ink leading-[1.9] mb-3 text-[15px] sm:text-base">{p.text}</p>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${verdictColor[p.verdict]}`}
                    title={p.note}
                  >
                    {lang === "en" ? verdictLabel[p.verdict].en : verdictLabel[p.verdict].zh}
                  </span>
                  {p.resolvedCitations.length > 0 && (
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="text-xs text-accent underline underline-offset-2 min-h-[44px] px-1"
                    >
                      {expanded[i]
                        ? lang === "en"
                          ? "Hide citations"
                          : "收起引用"
                        : lang === "en"
                          ? `Show ${p.resolvedCitations.length} citation(s)`
                          : `展开 ${p.resolvedCitations.length} 条引用`}
                    </button>
                  )}
                </div>
                {p.note && <p className="text-xs text-ink-soft italic mb-2">{p.note}</p>}
                {expanded[i] && (
                  <div className="paper-card mt-2 space-y-2 p-3">
                    {p.resolvedCitations.map((c) => (
                      <div key={c.id} className="text-xs text-ink-soft leading-relaxed">
                        <span className="font-mono text-accent">[{c.id}]</span> {c.text}
                        <span className="opacity-70"> — {c.source}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <MusicToggle />
      <GonkaBadge entries={entries} />
    </main>
  );
}
