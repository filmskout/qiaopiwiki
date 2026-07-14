# QiaopiWiki

A multilingual open knowledge Q&A engine about **Qiaopi** (侨批) — the letters and remittances
overseas Chinese sent home, inscribed on UNESCO's Memory of the World Register in 2013. Built for
the **AI³ Hackathon — Gonka track**.

## Features

- **Bilingual (中文 / English) Q&A** over a curated 45-fragment knowledge base: ~10 fragments from
  an interactive Qiaopi story, ~35 established historical facts (definition, UNESCO listing,
  Chaoshan/Minnan/Wuyi regions, shuike couriers, piju remittance houses, Southeast Asia routes,
  19th c.–1970s timeline, trust culture, Shantou Qiaopi Museum).
- **Two-model Gonka pipeline**: Kimi (`moonshotai/Kimi-K2.6`) answers strictly from retrieved
  fragments; MiniMax (`MiniMaxAI/MiniMax-M2.7`) independently verifies each paragraph's
  faithfulness and labels it **可溯源 / 部分不可溯源 / 不可溯源** (Traceable / Partially
  traceable / Not traceable).
- **Honest degradation**: no hidden confidence — every claim is either grounded in a cited
  fragment or flagged as unverifiable.
- **Full audit trail**: every Gonka call surfaces its Request ID, shown per-step and in a
  persistent bottom-right badge.
- Warm paper/sepia UI, 8 preset mixed-language question chips, mobile-friendly.

## Install & Run

```bash
npm install
cp .env.example .env.local   # fill in GONKA_API_KEY
npm run dev                  # http://localhost:3000
```

### Production build

```bash
env -u __NEXT_PRIVATE_STANDALONE_CONFIG -u TURBOPACK -u NEXT_DEPLOYMENT_ID -u __NEXT_PRIVATE_ORIGIN -u NODE_ENV npm run build
npm run start
```

> If your shell leaks a stale `NODE_ENV=production`, `npm install` will silently skip
> devDependencies (TypeScript, Tailwind) — unset it before installing too:
> `env -u NODE_ENV npm install`.

## Architecture

```
app/
  page.tsx              Q&A UI: lang toggle, preset chips, answer cards, citations, badge
  about/page.tsx         Project intro, honest-degradation explanation, AI for Society
  api/ask/route.ts       POST {question, lang} -> retrieval + Kimi answer + MiniMax verify
  globals.css            Warm sepia theme (Tailwind v4)
lib/
  gonka.ts               Shared Gonka client (gonkaCall, MODELS, requestId)
  search.ts              Keyword tokenizer + scorer over zh/en/tags -> top-6 fragments
  parseJson.ts            Robust LLM JSON parsing (strips markdown fences, bracket-matches)
  types.ts                Shared TS types
components/
  GonkaBadge.tsx          Bottom-right "Powered by Gonka" Request ID audit badge
data/
  knowledge.json          45 bilingual fragments: {id, zh, en, source, tags[]}
```

### `/api/ask` pipeline

1. **Retrieval** — tokenize the question (CJK single/bigram + Latin words), score against each
   fragment's `zh + en + tags`, take the top 6.
2. **Kimi answer** — given only those 6 fragments (in the requested language), Kimi returns strict
   JSON `{paragraphs:[{text, citations:[id,...]}]}`.
3. **MiniMax verify** — for each paragraph, MiniMax checks whether the text is actually supported
   by its cited fragments only, returning `{verdict, note}`.
4. **Response** — paragraphs with resolved citation text/source, verdicts, and every step's Gonka
   Request ID (`{requestId, model, step}`).

If `GONKA_API_KEY` is missing, the route returns a clear JSON error instead of calling the API.

## Gonka

- Base URL: `https://api.gonkarouter.io/v1` (OpenAI-compatible `/chat/completions`)
- Models: `moonshotai/Kimi-K2.6` (answer), `MiniMaxAI/MiniMax-M2.7` (verify)
- Every response's `id` field is surfaced as the Request ID in the UI badge — required for
  hackathon audit.

## Iteration Plan

- Expand the corpus beyond 45 fragments — more regional archives, oral histories, digitized
  ledgers.
- Add 粤语 (Cantonese) as a third UI/answer language alongside 中文/English.
- Partner with the Shantou Qiaopi Museum and Jiangmen Wuyi Overseas Chinese Museum for verified,
  citable primary sources and possible API access to their digitized collections.
- Vector/semantic retrieval to complement keyword scoring as the corpus grows.

---

## 中文摘要

QiaopiWiki 是面向侨批（海外华侨银信）的多语言开放知识问答引擎，为 AI³ Hackathon Gonka
赛道而作。知识库含 45 条中英双语史料片段（故事类 + 史料常识/UNESCO档案）。问答流程：关键词检索
top-6 片段 → Kimi 仅基于片段作答（严格 JSON，含引用）→ MiniMax 独立校验每段是否可溯源，标注"可溯源
/ 部分不可溯源 / 不可溯源"→ 返回带引用来源与各步骤 Gonka Request ID 的完整审计链路。界面为暖色纸感
风格，中文为主、英文字幕，支持移动端。后续计划：扩充语料、增加粤语、对接博物馆合作获取权威史料。

**安装运行**：`npm install && cp .env.example .env.local`（填入 `GONKA_API_KEY`）`&& npm run dev`。
