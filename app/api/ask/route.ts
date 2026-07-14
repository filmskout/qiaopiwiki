import { NextRequest, NextResponse } from "next/server";
import { gonkaCall, MODELS } from "@/lib/gonka";
import { retrieveFragments } from "@/lib/search";
import { parseJsonLoose } from "@/lib/parseJson";
import type {
  AnswerParagraph,
  Citation,
  GonkaStepEntry,
  KnowledgeFragment,
  VerifiedParagraph,
} from "@/lib/types";

export const runtime = "nodejs";

interface AskBody {
  question?: string;
  lang?: "zh" | "en";
}

interface KimiAnswer {
  paragraphs: AnswerParagraph[];
}

interface VerifyResult {
  verdict: "可溯源" | "部分不可溯源" | "不可溯源";
  note: string;
}

function fragmentsToContext(frags: KnowledgeFragment[], lang: "zh" | "en"): string {
  return frags
    .map((f) => {
      const text = lang === "en" ? f.en : f.zh;
      return `[${f.id}] ${text} (来源/source: ${f.source})`;
    })
    .join("\n");
}

export async function POST(req: NextRequest) {
  if (!process.env.GONKA_API_KEY) {
    return NextResponse.json(
      { error: "GONKA_API_KEY is not set on the server. Configure it in .env.local to enable Q&A." },
      { status: 500 },
    );
  }

  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  const lang: "zh" | "en" = body.lang === "en" ? "en" : "zh";
  if (!question) {
    return NextResponse.json({ error: "question is required." }, { status: 400 });
  }

  const fragments = retrieveFragments(question, 6);
  const context = fragmentsToContext(fragments, lang);
  const steps: GonkaStepEntry[] = [];

  // Step 1: Kimi answers using only the retrieved fragments.
  const answerLangInstruction =
    lang === "en"
      ? "Answer in English."
      : "用中文回答。";
  const kimiSystem = `You are QiaopiWiki, a careful knowledge assistant about Qiaopi (侨批, overseas Chinese remittance letters). ${answerLangInstruction}
Use ONLY the numbered fragments below as your source of truth. Do not invent facts outside them. If the fragments don't cover the question, say so honestly.
Respond with STRICT JSON only, no markdown fences, in this shape:
{"paragraphs":[{"text":"...", "citations":["f01","s02"]}]}
Each paragraph's "citations" must list the fragment ids it actually draws from.

Fragments:
${context}`;

  let kimiResult;
  try {
    kimiResult = await gonkaCall(MODELS.KIMI, [
      { role: "system", content: kimiSystem },
      { role: "user", content: question },
    ]);
  } catch (err) {
    return NextResponse.json(
      { error: `Kimi 回答生成失败 / Kimi answer generation failed: ${(err as Error).message}` },
      { status: 502 },
    );
  }
  steps.push({ requestId: kimiResult.requestId, model: kimiResult.model, step: "Kimi 作答 / Answer" });

  const parsedAnswer = parseJsonLoose<KimiAnswer>(kimiResult.output);
  const paragraphs: AnswerParagraph[] =
    parsedAnswer?.paragraphs && Array.isArray(parsedAnswer.paragraphs) && parsedAnswer.paragraphs.length > 0
      ? parsedAnswer.paragraphs
      : [{ text: kimiResult.output.trim() || "（无法生成回答 / Unable to generate an answer）", citations: [] }];

  // Step 2: MiniMax verifies each paragraph's faithfulness to the cited fragments.
  const verifiedParagraphs: VerifiedParagraph[] = [];
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const citedFrags = fragments.filter((f) => para.citations.includes(f.id));
    const resolvedCitations: Citation[] = citedFrags.map((f) => ({
      id: f.id,
      text: lang === "en" ? f.en : f.zh,
      source: f.source,
    }));

    const verifySystem = `You are a strict fact-checker for QiaopiWiki. Given a paragraph and the fragments it cites, judge whether the paragraph is faithfully supported by ONLY those fragments.
Respond with STRICT JSON only, no markdown fences:
{"verdict":"可溯源"|"部分不可溯源"|"不可溯源","note":"brief reason in ${lang === "en" ? "English" : "Chinese"}"}
"可溯源" = fully supported. "部分不可溯源" = partially supported / minor unsupported claims. "不可溯源" = not supported at all or cites nothing relevant.`;
    const verifyUser = `Paragraph:\n${para.text}\n\nCited fragments:\n${
      citedFrags.map((f) => `[${f.id}] ${lang === "en" ? f.en : f.zh}`).join("\n") || "(none cited)"
    }`;

    let verdict: VerifyResult = { verdict: "部分不可溯源", note: "验证请求失败 / verification request failed" };
    try {
      const minimaxResult = await gonkaCall(MODELS.MINIMAX, [
        { role: "system", content: verifySystem },
        { role: "user", content: verifyUser },
      ]);
      steps.push({
        requestId: minimaxResult.requestId,
        model: minimaxResult.model,
        step: `MiniMax 校验 / Verify §${i + 1}`,
      });
      const parsedVerdict = parseJsonLoose<VerifyResult>(minimaxResult.output);
      if (parsedVerdict?.verdict) {
        verdict = parsedVerdict;
      }
    } catch (err) {
      verdict = { verdict: "部分不可溯源", note: `校验出错 / verification error: ${(err as Error).message}` };
    }

    verifiedParagraphs.push({
      ...para,
      resolvedCitations,
      verdict: verdict.verdict,
      note: verdict.note ?? "",
    });
  }

  return NextResponse.json({ paragraphs: verifiedParagraphs, steps });
}
