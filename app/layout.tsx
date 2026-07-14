import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QiaopiWiki · 侨批知识问答",
  description:
    "A multilingual open knowledge Q&A engine about Qiaopi (侨批), overseas Chinese remittance letters — AI³ Hackathon Gonka track.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
