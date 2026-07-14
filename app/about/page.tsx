import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-accent text-sm underline underline-offset-4">
          ← 返回问答 / Back to Q&amp;A
        </Link>

        <h1 className="text-3xl font-bold text-ink mt-4 mb-2">关于 QiaopiWiki</h1>
        <p className="text-ink-soft mb-8 text-sm">About QiaopiWiki</p>

        <section className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-ink mb-2">项目简介 · Project Intro</h2>
          <p className="text-ink leading-relaxed mb-3">
            QiaopiWiki 是一个面向侨批（Qiaopi，海外华侨银信）的多语言开放知识问答引擎，为 AI³ Hackathon
            Gonka 赛道而作。侨批档案已于 2013 年入选联合国教科文组织《世界记忆名录》，是研究近现代华侨史珍贵的第一手史料。
            我们希望用 AI 让这段历史更容易被检索、理解与传播。
          </p>
          <p className="text-ink-soft leading-relaxed text-sm">
            QiaopiWiki is a multilingual open knowledge Q&amp;A engine about Qiaopi — letters and remittances
            sent by overseas Chinese, inscribed on UNESCO&apos;s Memory of the World Register in 2013. Built for
            the AI³ Hackathon Gonka track, it aims to make this history easier to search, understand, and share.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-ink mb-2">诚实降级 · Honest Degradation</h2>
          <p className="text-ink leading-relaxed mb-3">
            每一个回答都必须溯源到知识库中的具体片段。我们不追求"看起来聪明"的回答，而是让 AI
            诚实地承认知识边界：Kimi 仅基于检索到的片段作答，MiniMax
            独立校验每段是否真正可从引用片段中推导，并标注"可溯源 / 部分不可溯源 / 不可溯源"，
            而不是掩盖不确定性。
          </p>
          <p className="text-ink-soft leading-relaxed text-sm">
            Every answer must trace back to a specific fragment in our knowledge base. Rather than optimizing
            for answers that merely sound confident, we let the AI honestly admit the boundaries of its
            knowledge: Kimi answers using only retrieved fragments, and MiniMax independently verifies whether
            each paragraph is truly derivable from its citations — labeling it Traceable, Partially traceable,
            or Not traceable instead of hiding uncertainty.
          </p>
        </section>

        <section className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-ink mb-2">AI for Society</h2>
          <p className="text-ink leading-relaxed mb-3">
            侨批承载着华侨华人跨越百年的乡愁与诚信精神。通过去中心化的 Gonka
            网络驱动问答与交叉验证，我们希望展示 AI 如何服务于文化遗产的开放获取与公共教育，
            而非被少数机构垄断叙事权。
          </p>
          <p className="text-ink-soft leading-relaxed text-sm">
            Qiaopi carry a century of homesickness and trust across the overseas Chinese diaspora. By running
            Q&amp;A and cross-verification on the decentralized Gonka network, we hope to show how AI can serve
            open access to cultural heritage and public education — rather than letting narrative power be
            monopolized by a few institutions.
          </p>
        </section>

        <section className="card p-6">
          <h2 className="text-xl font-semibold text-ink mb-2">技术架构 · Architecture</h2>
          <ul className="text-ink-soft text-sm leading-relaxed list-disc pl-5 space-y-1">
            <li>Next.js 14 (App Router) + TypeScript + Tailwind CSS</li>
            <li>知识库：本地 JSON，45 条中英双语史料片段 / Local JSON, 45 bilingual fragments</li>
            <li>检索：关键词分词 + 打分（zh/en/tags）/ Keyword tokenize &amp; score retrieval</li>
            <li>
              生成：Gonka 网络 Kimi (moonshotai/Kimi-K2.6) 作答 + MiniMax (MiniMaxAI/MiniMax-M2.7) 交叉校验 /
              Gonka-routed Kimi answers, MiniMax cross-verifies
            </li>
            <li>每次调用返回 Gonka Request ID，全流程可审计 / Every call surfaces a Gonka Request ID for audit</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
