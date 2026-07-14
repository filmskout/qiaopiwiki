"use client";

import Link from "next/link";
import { useState } from "react";
import { GonkaBadge, GonkaRequestEntry } from "@/components/GonkaBadge";
import type { AskErrorResponse, AskResponse, VerifiedParagraph } from "@/lib/types";

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
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex flex-col items-center text-center gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-ink tracking-wide">侨批知识 · QiaopiWiki</h1>
          <p className="text-ink-soft text-sm md:text-base">
            多语言开放知识问答 · A multilingual open knowledge Q&amp;A engine about Qiaopi
          </p>
          <nav className="mt-2 flex gap-4 text-sm text-accent underline underline-offset-4">
            <Link href="/about">关于项目 / About</Link>
          </nav>
        </header>

        <div className="card p-5 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setLang("zh")}
                className={`chip px-4 py-1.5 text-sm ${lang === "zh" ? "!bg-accent !text-white" : ""}`}
              >
                中文
              </button>
              <button
                onClick={() => setLang("en")}
                className={`chip px-4 py-1.5 text-sm ${lang === "en" ? "!bg-accent !text-white" : ""}`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(lang === "en" ? p.en : p.zh);
                  ask(lang === "en" ? p.en : p.zh);
                }}
                className="chip px-3 py-1 text-xs"
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
            className="flex gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={lang === "en" ? "Ask about Qiaopi..." : "问问侨批的故事……"}
              className="flex-1 rounded-full border border-[#d9c69a] bg-white px-4 py-2 text-sm outline-none focus:border-accent"
            />
            <button type="submit" disabled={loading} className="btn-accent px-5 py-2 text-sm disabled:opacity-50">
              {loading ? (lang === "en" ? "Asking…" : "查询中…") : lang === "en" ? "Ask" : "提问"}
            </button>
          </form>
        </div>

        {error && (
          <div className="card p-4 mb-6 border-red-300 bg-red-50 text-red-800 text-sm">{error}</div>
        )}

        {paragraphs && (
          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <div key={i} className="card p-5">
                <p className="text-ink leading-relaxed mb-3">{p.text}</p>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${verdictColor[p.verdict]}`}
                    title={p.note}
                  >
                    {lang === "en" ? verdictLabel[p.verdict].en : verdictLabel[p.verdict].zh}
                  </span>
                  {p.resolvedCitations.length > 0 && (
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="text-xs text-accent underline underline-offset-2"
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
                  <div className="mt-2 space-y-2 border-t border-[#e2d3ae] pt-3">
                    {p.resolvedCitations.map((c) => (
                      <div key={c.id} className="text-xs text-ink-soft">
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
      <GonkaBadge entries={entries} />
    </main>
  );
}
