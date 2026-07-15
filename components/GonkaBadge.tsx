"use client";
/**
 * Shared "Powered by Gonka · Request ID" badge — hackathon 强制项组件, 三项目复用.
 * Fixed bottom-right; expands to show the Request ID audit list; copy-all button.
 *
 * Usage:
 *   const [ids, setIds] = useState<GonkaRequestEntry[]>([]);
 *   // after each API call: setIds(prev => [...prev, { requestId, model, step }])
 *   <GonkaBadge entries={ids} />
 */
import { useState } from "react";

export interface GonkaRequestEntry {
  requestId: string;
  model: string;
  step?: string; // e.g. "主张拆解" / "Kimi 裁决"
}

export function GonkaBadge({ entries }: { entries: GonkaRequestEntry[] }) {
  const [open, setOpen] = useState(false);
  const copyAll = () =>
    navigator.clipboard.writeText(JSON.stringify(entries, null, 2));

  return (
    <div
      className="fixed z-[1000] right-2 bottom-2 md:right-4 md:bottom-4"
      style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        maxWidth: "calc(100vw - 16px)",
      }}
    >
      {open && (
        <div
          className="max-h-[45vh] md:max-h-[260px]"
          style={{
            marginBottom: 8,
            width: "min(340px, calc(100vw - 16px))",
            overflowY: "auto",
            background: "rgba(17,17,27,0.95)",
            color: "#d7d7e0",
            borderRadius: 10,
            border: "1px solid #3b3b52",
            padding: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong>Gonka Request IDs ({entries.length})</strong>
            <button onClick={copyAll} style={btn}>Copy JSON</button>
          </div>
          {entries.length === 0 && <div style={{ opacity: 0.6 }}>No requests yet</div>}
          {entries.map((e, i) => (
            <div key={i} style={{ padding: "4px 0", borderTop: "1px solid #2a2a3d" }}>
              {e.step && <span style={{ color: "#8ab4ff" }}>{e.step} · </span>}
              <span style={{ color: "#9f9fb3" }}>{e.model.split("/").pop()}</span>
              <div style={{ wordBreak: "break-all" }}>{e.requestId}</div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[10px] md:text-xs"
        style={{
          ...btn,
          padding: "6px 10px",
          borderRadius: 999,
          background: "#111120",
          border: "1px solid #3b3b52",
          color: "#d7d7e0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
          minHeight: 32,
        }}
      >
        ⚡ Gonka · {entries.length} ID{entries.length === 1 ? "" : "s"}
      </button>
    </div>
  );
}

const btn: React.CSSProperties = {
  cursor: "pointer",
  background: "#26263a",
  color: "#d7d7e0",
  border: "1px solid #3b3b52",
  borderRadius: 6,
  padding: "2px 8px",
  fontSize: 11,
};
