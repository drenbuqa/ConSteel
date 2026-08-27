"use client";

import Link from "next/link";
import { useState } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

interface Project {
  id: string;
  name: string;
  client: { name: string };
  shpenzimeOperative: number;
  shpenzimeMateriali: number;
  shpenzimeUshqimBonuse: number;
  shpenzimeTransportSherbimi: number;
  puneShteseTotal: number;
  totaliShpenzimeve: number;
}

interface Totals {
  operative: number;
  materiali: number;
  ushqim: number;
  transport: number;
  extra: number;
}

export default function ExpenseTable({ projects, totals, grandTotal }: {
  projects: Project[];
  totals: Totals;
  grandTotal: number;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Shpenzime sipas projektit</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{projects.length} projekte</div>
        </div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>
          Total: {fmt(grandTotal)}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Projekti", "Operative", "Materiali", "Ushqim", "Transport", "Shtesë", "Total"].map((h, i) => (
                <th key={h} style={{
                  padding: "10px 14px",
                  textAlign: i === 0 ? "left" : "right",
                  fontSize: "10.5px", fontWeight: "700", color: i === 6 ? "#374151" : "#9CA3AF",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  borderBottom: "1px solid #EAECF0", whiteSpace: "nowrap",
                  borderLeft: i === 6 ? "1px solid #EAECF0" : "none",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => {
              const isEmpty = p.totaliShpenzimeve === 0;
              const isHovered = hoveredId === p.id;
              const isLast = i === projects.length - 1;
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: isLast ? "none" : "1px solid #F3F4F6",
                    cursor: "pointer",
                    background: isHovered ? "#F9FAFB" : "white",
                    boxShadow: isHovered ? "inset 3px 0 0 #111827" : "none",
                    transition: "background 0.12s, box-shadow 0.12s",
                    opacity: isEmpty ? 0.5 : 1,
                  }}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => { window.location.href = `/projektet/${p.id}`; }}
                >
                  <td style={{ padding: "12px 14px", minWidth: "160px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{p.client.name}</div>
                  </td>
                  {[p.shpenzimeOperative, p.shpenzimeMateriali, p.shpenzimeUshqimBonuse, p.shpenzimeTransportSherbimi, p.puneShteseTotal].map((v, j) => (
                    <td key={j} style={{ padding: "12px 14px", fontSize: "12.5px", color: v > 0 ? "#374151" : "#D1D5DB", textAlign: "right", whiteSpace: "nowrap" }}>
                      {v > 0 ? fmt(v) : "—"}
                    </td>
                  ))}
                  <td style={{
                    padding: "12px 14px", textAlign: "right", whiteSpace: "nowrap",
                    borderLeft: "1px solid #F3F4F6",
                    fontSize: "13px", fontWeight: "700",
                    color: p.totaliShpenzimeve > 0 ? "#111827" : "#D1D5DB",
                  }}>
                    {p.totaliShpenzimeve > 0 ? fmt(p.totaliShpenzimeve) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {projects.length > 0 && (
            <tfoot>
              <tr style={{ background: "#F3F4F6", borderTop: "2px solid #E5E7EB" }}>
                <td style={{ padding: "13px 14px", fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Total gjithsej
                </td>
                {[totals.operative, totals.materiali, totals.ushqim, totals.transport, totals.extra].map((v, j) => (
                  <td key={j} style={{ padding: "13px 14px", fontSize: "12.5px", fontWeight: "600", color: "#374151", textAlign: "right", whiteSpace: "nowrap" }}>
                    {fmt(v)}
                  </td>
                ))}
                <td style={{ padding: "10px 14px", textAlign: "right", whiteSpace: "nowrap", borderLeft: "1px solid #E5E7EB" }}>
                  <span style={{
                    display: "inline-block",
                    background: "#111827", color: "white",
                    fontSize: "12.5px", fontWeight: "700",
                    padding: "4px 10px", borderRadius: "6px",
                    letterSpacing: "-0.2px",
                  }}>
                    {fmt(grandTotal)}
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {projects.length === 0 && (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg width="22" height="22" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>Nuk ka shpenzime të regjistruara</div>
            <div style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "300px", margin: "0 auto 20px", lineHeight: 1.6 }}>
              Filloni duke krijuar projektin e parë dhe regjistroni shpenzimet e tij.
            </div>
            <Link href="/projektet/i-ri" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", background: "#111827", color: "white", borderRadius: "9px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              + Krijo projekt të ri
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
