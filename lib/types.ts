export interface KnowledgeFragment {
  id: string;
  zh: string;
  en: string;
  source: string;
  tags: string[];
}

export interface Citation {
  id: string;
  text: string;
  source: string;
}

export interface AnswerParagraph {
  text: string;
  citations: string[];
}

export interface VerifiedParagraph extends AnswerParagraph {
  resolvedCitations: Citation[];
  verdict: "可溯源" | "部分不可溯源" | "不可溯源";
  note: string;
}

export interface GonkaStepEntry {
  requestId: string;
  model: string;
  step: string;
}

export interface AskResponse {
  paragraphs: VerifiedParagraph[];
  steps: GonkaStepEntry[];
}

export interface AskErrorResponse {
  error: string;
}
